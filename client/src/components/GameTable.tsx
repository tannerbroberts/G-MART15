import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { socketService } from '../services/socketService';

interface Player {
  id: string;
  name: string;
  status: 'active' | 'smoke_break' | 'pending_game_start';
  position: number;
}

interface GameTableProps {
  tableId: string;
  currentPlayerId: string;
  onSmokeBreak: () => void;
  onRejoin: () => void;
  onExit: () => void;
}

const GameTable: React.FC<GameTableProps> = ({
  tableId,
  currentPlayerId,
  onSmokeBreak,
  onRejoin,
  onExit
}) => {
  const gameUrl = `${window.location.origin}/table/${tableId}`;

  return (
    <div className="game-table">
      {/* Dealer's area */}
      <div className="dealer-area">
        <div className="dealer-cards">
          <h3>DEALER'S HAND</h3>
          <div className="card-placeholder"></div>
        </div>
      </div>

      {/* QR code area */}
      <div className="qr-area">
        <div className="qr-container">
          <QRCodeSVG
            value={gameUrl}
            size={100}
            level="H"
            marginSize={4}
            bgColor={"#FFFFFF"}
            fgColor={"#2c3e50"}
          />
        </div>
      </div>

      {/* Player positions */}
      <div className="player-positions">
        {/* Left side players */}
        <div className="left-players">
          <div className="player-position position-1">
            <div className="player-avatar">
              <span className="avatar-circle"></span>
            </div>
            <div className="player-cards">
              <div className="card-placeholder"></div>
            </div>
          </div>
          <div className="player-position position-2">
            <div className="player-avatar">
              <span className="avatar-circle"></span>
            </div>
            <div className="player-cards">
              <div className="card-placeholder"></div>
            </div>
          </div>
        </div>

        {/* Center players */}
        <div className="center-players">
          <div className="player-position position-3">
            <div className="player-avatar">
              <span className="avatar-circle"></span>
            </div>
            <div className="player-cards">
              <div className="card-placeholder"></div>
            </div>
          </div>
          <div className="player-position position-4 current-player">
            <div className="player-avatar">
              <span className="avatar-circle"></span>
            </div>
            <div className="player-cards">
              <div className="card-placeholder"></div>
            </div>
          </div>
        </div>

        {/* Right side players */}
        <div className="right-players">
          <div className="player-position position-5">
            <div className="player-avatar">
              <span className="avatar-circle"></span>
            </div>
            <div className="player-cards">
              <div className="card-placeholder"></div>
            </div>
          </div>
          <div className="player-position position-6">
            <div className="player-avatar">
              <span className="avatar-circle"></span>
            </div>
            <div className="player-cards">
              <div className="card-placeholder"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="stay-btn" onClick={onRejoin}>
          REJOIN
        </button>
        <button className="bet-btn" onClick={onSmokeBreak}>
          SMOKE BREAK
        </button>
        <button className="exit-btn" onClick={onExit}>
          CASH OUT
        </button>
      </div>
    </div>
  );
};

export default GameTable;