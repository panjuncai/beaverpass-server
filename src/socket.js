import loadEnv from './config/env.js';
import { Server } from 'socket.io';

loadEnv();
let io;

export default {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:5173", "https://www.bigclouder.com", "https://bigclouder.com"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
}; 