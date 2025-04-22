import React, { useEffect, useState } from 'react';
import { useSocket } from '../socket';
import { TableState } from '../types';
import QRCode from 'qrcode.react';
import styles from './Lobby.module.css';

const Lobby = ({ tableId }: { tableId: string }) => {
  const [table, setTable] = useState<TableState | null>(null);
  const socket = useSocket();

  useEffect(() => {
    socket.emit('join-table', { tableId, playerName: 'Player' });

    socket.on('table-update', (updatedTable: TableState) => {
      setTable(updatedTable);
    });

    return () => {
      socket.off('table-update');
    };
  }, [tableId]);

  return (
    <div className={styles.lobbyContainer}>
      {table?.isGameActive && <div className={styles.smokeOverlay} />}

      <div className={styles.qrCodeContainer}>
        <QRCode value={`${window.location.origin}/table/${tableId}`} />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => socket.emit('player-status', { status: 'smoke_break' })}>
          Smoke Break
        </button>
        <button onClick={() => navigator.clipboard.writeText(window.location.href)}>
          Share Link
        </button>
      </div>
    </div>
  );
};

export default Lobby;

