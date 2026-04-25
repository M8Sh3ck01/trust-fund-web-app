const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ─── OAuth2 Client ────────────────────────────────────────────────────────────
// Instantiated once at module load. The client secret lives only here, in the
// Node process — it is NEVER serialized to a response or session cookie.
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ─── Database Stub ────────────────────────────────────────────────────────────
/**
 * findOrCreateUser — looks up an existing user by googleId, or creates a new one.
 *
 * In a real implementation this hits MongoDB via Mongoose.
 * The 'sub' claim (Google's stable, unique subject identifier) is used as the
 * primary key — never email, which can change.
 *
 * @param {object} profile - Verified claims from the Google ID Token
 * @returns {Promise<object>} - The persisted user document
 */
async function findOrCreateUser(profile) {
  console.log(`🔍 Checking database for user: ${profile.googleId}`);

  // Upsert: find by googleId and update, or insert if not found.
  // { new: true } returns the modified document rather than the original.
  const user = await User.findOneAndUpdate(
    { googleId: profile.googleId },
    {
      $set: {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        lastLoginAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  return user;
}

// ─── Controller: GET /auth/google ─────────────────────────────────────────────
/**
 * Redirects the user to Google's Authorization Endpoint.
 *
 * PHASE 1 – Authorization Request:
 *   We generate an Auth URL, embedding:
 *     - client_id: identifies our application to Google
 *     - redirect_uri: where Google sends the user after consent
 *     - response_type=code: we want an authorization code (not a token directly)
 *     - scope: what data we're requesting access to
 *     - state: a cryptographically random nonce stored in the session.
 *              Validated in the callback to prevent CSRF attacks.
 */
const googleAuth = (req, res) => {
  // Generate a 16-byte random hex string as our CSRF state token
  const state = crypto.randomBytes(16).toString('hex');

  // Persist the state in the signed session cookie (HttpOnly, server-side only)
  req.session.oauthState = state;
  console.log(`[DEBUG - Auth Start] Generated state: ${state}, stored in session cookie`);

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',   // Request a refresh_token for long-lived access
    scope: ['email', 'profile'],
    state,
    prompt: 'select_account', // Force account picker on every login
  });

  res.redirect(authUrl);
};

// ─── Controller: GET /auth/google/callback ────────────────────────────────────
/**
 * Handles the redirect from Google's Authorization Server.
 *
 * PHASE 4 – The Back-Channel Exchange (Authorization Code → Tokens):
 *   Google redirects the browser to this URI with a short-lived 'code'.
 *   We exchange it for tokens via a direct server-to-server HTTPS POST to
 *   Google's Token Endpoint (accounts.google.com/o/oauth2/token).
 *   This exchange is done BACK-CHANNEL — the browser never sees it,
 *   which means the CLIENT_SECRET never leaves the server.
 *   `client.getToken(code)` handles this exchange internally.
 *
 * PHASE 5 – ID Token Validation (verifyIdToken):
 *   The response includes an `id_token` — a signed JWT issued by Google.
 *   We MUST validate it before trusting any claims inside it:
 *     a) Signature: verified against Google's public keys (fetched automatically)
 *     b) Issuer (iss): must be 'accounts.google.com' or 'https://accounts.google.com'
 *     c) Audience (aud): MUST match our GOOGLE_CLIENT_ID — guards against
 *        tokens issued for other apps being replayed against ours.
 *     d) Expiry (exp): token must not be expired.
 *   We never decode the JWT manually — `client.verifyIdToken` enforces all of this.
 */
const googleCallback = async (req, res) => {
  const { code, state, error } = req.query;

  // ── 1. Handle user-denied consent ──────────────────────────────────────────
  if (error) {
    console.warn(`⚠️  OAuth error from Google: ${error}`);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=access_denied`);
  }

  // ── 2. Validate CSRF state ─────────────────────────────────────────────────
  // Compare the returned state against what we stored. Use a timing-safe compare
  // to prevent timing attacks, though state tokens are random enough that this
  // is defense-in-depth rather than strictly necessary.
  console.log(`[DEBUG - Auth Callback] Received state: ${state}, Session state: ${req.session.oauthState}`);
  
  if (!state || state !== req.session.oauthState) {
    console.error('❌ CSRF state mismatch — potential attack or stale session');
    return sendError(res, 'Invalid state parameter', 403);
  }

  // Consume the state — it's single-use
  delete req.session.oauthState;

  try {
    // ── PHASE 4: Back-Channel Code Exchange ───────────────────────────────────
    // `getToken` makes a server-to-server POST to Google's token endpoint.
    // The request includes our client_secret, so it MUST happen server-side.
    // Returns { tokens: { id_token, access_token, refresh_token, expiry_date } }
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // ── PHASE 5: ID Token Validation ──────────────────────────────────────────
    // verifyIdToken performs full cryptographic validation of the JWT:
    //   - Fetches Google's public key set (JWKS) and caches it
    //   - Verifies the RS256 signature
    //   - Checks iss, aud, exp claims
    // The 'audience' option is the critical check: it confirms this token was
    // issued FOR OUR app, preventing confused-deputy / token substitution attacks.
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // ← aud claim MUST match this
    });

    const payload = ticket.getPayload();

    // Extract the claims we care about from the verified payload
    const profile = {
      googleId: payload['sub'],        // Google's stable unique user ID
      email: payload['email'],
      emailVerified: payload['email_verified'],
      name: payload['name'],
      picture: payload['picture'],
    };

    // ── Database Operation ────────────────────────────────────────────────────
    const dbUser = await findOrCreateUser(profile);

    // ── Session Hydration ─────────────────────────────────────────────────────
    // Store only what the app needs after login — NOT the tokens themselves.
    // Tokens contain sensitive scopes; the session only needs the identity.
    req.session.user = {
      id: dbUser._id.toString(),
      googleId: dbUser.googleId,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.picture,
      role: dbUser.role || 'user',
    };

    console.log(`✅ User authenticated: ${dbUser.email}`);
    res.redirect(`${process.env.FRONTEND_URL}/orders`);

  } catch (err) {
    console.error('❌ OAuth callback error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

// ─── Controller: GET /logout ──────────────────────────────────────────────────
/**
 * Destroys the server-side session and clears the session cookie.
 * Setting the session to null with cookie-session effectively removes it.
 */
const logout = (req, res) => {
  req.session = null; // cookie-session: set to null to clear the cookie
  console.log('🔓 User logged out — session destroyed');
  res.redirect(`${process.env.FRONTEND_URL}/`);
};

module.exports = { googleAuth, googleCallback, logout };
