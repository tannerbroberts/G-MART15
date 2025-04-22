import { Server, Socket } from 'socket.io';
import { TableService, PlayerService } from '../services';
import pool from '../database/pool';

export const configureGameSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    let tableId: string;
    let playerId: string;

    const heartbeatInterval = setInterval(async () => {
      if (playerId) await PlayerService.handleHeartbeat(playerId);
    }, 2000);

    socket.on('join-table', async ({ tableId: tid, playerName }) => {
      tableId = tid;
      playerId = socket.id;

      try {
        await pool.execute(`
          INSERT INTO players
          (id, table_id, name, status, seat_number, chips)
          VALUES (?, ?, ?, 'pending_game_start',
            (SELECT COUNT(*) FROM players WHERE table_id = ?) + 1, 1000)
        `, [playerId, tableId, playerName, tableId]);

        const tableState = await TableService.getTableState(tableId);
        io.to(tableId).emit('table-update', tableState);
      } catch (error) {
        console.error('Join error:', error);
      }
    });

    socket.on('disconnect', () => {
      clearInterval(heartbeatInterval);
      PlayerService.updateStatus(playerId, 'disconnected');
    });
  });
};
