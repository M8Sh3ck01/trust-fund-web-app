'use strict';

// ── Load environment variables FIRST — before any other imports ───────────────
// This ensures process.env.* is populated for all modules that read it
// at require-time (e.g., authController initialising OAuth2Client).
require('dotenv').config();

const express    = require('express');
const cookieSession = require('cookie-session');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const http       = require('http');
const connectDB  = require('./src/config/db');
const { initSocket } = require('./src/utils/socket');
const authRoutes = require('./src/routes/auth');
const orderRoutes = require('./src/routes/order');
const mealRoutes = require('./src/routes/meal');
const bookingRoutes = require('./src/routes/booking');
const userRoutes = require('./src/routes/userRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { sendError } = require('./src/utils/responseHelper');

// ── Validate required environment variables at startup ────────────────────────
const REQUIRED_ENV = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'SESSION_SECRET',
  'MONGO_URI',
  'FRONTEND_URL',
];

const missingVars = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Copy .env.example → .env and fill in your values.');
  process.exit(1);
}

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1); // Trust the first proxy (e.g., Vite dev server or Nginx)

// ── Security Headers (helmet) ─────────────────────────────────────────────────
// Sets sensible HTTP security headers (X-Content-Type-Options, HSTS, etc.)
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// Dynamically allow local network origins for mobile testing.
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin);
      const isLocalNetwork = origin.startsWith('http://192.168.') || origin.startsWith('http://10.');
      
      if (isAllowed || isLocalNetwork) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ── Request Logging ───────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Session (cookie-session) ──────────────────────────────────────────────────
// cookie-session stores the session DATA in the signed cookie itself (no server-side store).
// This is acceptable for small payloads (user ID, name, email).
// The 'keys' array enables key rotation — the first key signs, all keys can verify.
//
// Security flags:
//   httpOnly: true  → Cookie inaccessible to JavaScript (mitigates XSS)
//   secure: true    → Cookie only sent over HTTPS (enforced in production)
//   sameSite: 'lax' → Cookie sent on top-level navigations but not cross-site POSTs
//                      (mitigates CSRF — combined with our state parameter)
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes); // Left at root so Google Console redirect URL doesn't break
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Health check — useful for container orchestration (K8s, ECS, Railway, etc.)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  return sendError(res, message, 500);
});

// ── Start Server (after DB is ready) ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

connectDB().then(() => {
  const httpServer = http.createServer(app);
  
  // Initialize Socket.io
  initSocket(httpServer);

  httpServer.listen(PORT, HOST, () => {
    const { address, port } = httpServer.address();
    const host = address === '::' || address === '0.0.0.0' ? 'localhost' : address;
    
    console.log(`\n🚀 Server is running on all interfaces (0.0.0.0)`);
    console.log(`   Local:            http://localhost:${port}`);
    console.log(`   Network (approx): http://${require('os').networkInterfaces().eth1?.[0]?.address || 'your-ip'}:${port}`);
    console.log(`\n   Auth Flow:        http://${host}:${port}/auth/google`);
    console.log(`   Health Check:     http://${host}:${port}/health`);
    console.log(`   Environment:      ${process.env.NODE_ENV}\n`);
  });
});
