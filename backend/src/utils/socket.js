'use strict';

const { Server } = require('socket.io');

let io;

/**
 * initSocket - Initializes Socket.io on the provided HTTP server.
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['polling', 'websocket']
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);

    // Join rooms based on userId for private updates
    socket.on('join_personal_room', (userId) => {
      console.log(`🏠 Socket ${socket.id} joining room: user:${userId}`);
      socket.join(`user:${userId}`);
    });

    // Join staff room for global updates
    socket.on('join_staff_room', () => {
      console.log(`👨‍🍳 Socket ${socket.id} joining staff dashboard`);
      socket.join('staff_dashboard');
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * getIO - Returns the initialized io instance.
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket(server) first.');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
