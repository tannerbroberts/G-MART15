import http from 'http';
import { Server } from 'socket.io';
import { configureGameSockets } from './socket/game.socket';
import pool from './database/pool';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Database connection check
pool.getConnection()
  .then(conn => {
    conn.release();
    console.log('✅ Database connected');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

configureGameSockets(io);

server.listen(3001, () => {
  console.log('🚀 Server running on port 3001');
});