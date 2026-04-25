import { io } from 'socket.io-client';

// Use same base URL as API client
const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

/**
 * socketClient - Singleton socket instance for the frontend.
 * Configured with automatic reconnection and credential support.
 */
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['polling', 'websocket'], // Force both for better handshake reliability
});

socket.on('connect', () => {
  console.log('⚡ Connected to real-time server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('🔌 Disconnected from server:', reason);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});

export default socket;
