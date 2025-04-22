import { io } from 'socket.io-client';

export const useSocket = () => {
  return io(import.meta.env.VITE_SERVER_URL, {
    autoConnect: true,
    reconnectionAttempts: 5
  });
};
