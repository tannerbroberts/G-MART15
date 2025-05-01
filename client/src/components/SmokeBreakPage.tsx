import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { socketService } from '../services/socketService';
import '../styles/GameTable.css';

type PlayerStatus = "active" | "smoke_break" | "pending_game_start";
type ConnectionStatus = "connected" | "disconnected";

const SmokeBreakPage: React.FC = () => {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("active");
  const [showSmokeEffect, setShowSmokeEffect] = useState(false);
  const [tableId] = useState('smoke-break-table');

  const gameUrl = `${window.location.origin}/smoke-break/${tableId}`;

  const checkConnection = useCallback(() => {
    if (socketService.isConnected()) {
      setConnectionStatus("connected");
      setConnectionError(null);
    } else {
      setConnectionStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkConnection, 1000);
    checkConnection();
    return () => clearInterval(interval);
  }, [checkConnection]);

  useEffect(() => {
    const handlePlayerStatusUpdate = (playerId: string, status: PlayerStatus) => {
      setPlayerStatus(status);
      setShowSmokeEffect(status === "smoke_break");
    };

    socketService.onPlayerStatusUpdate(handlePlayerStatusUpdate);
    return () => socketService.onPlayerStatusUpdate(() => {});
  }, []);

  const handleRejoin = useCallback(() => {
    if (connectionStatus !== "connected") {
      setConnectionError("Cannot rejoin: Not connected to server");
      return;
    }
    socketService.requestRejoin();
  }, [connectionStatus]);

  const handleExit = useCallback(() => {
    socketService.exitGame();
    navigate("/test");
  }, [navigate]);

  const handleSmokeBreak = useCallback(() => {
    if (connectionStatus !== "connected") {
      setConnectionError("Cannot request smoke break: Not connected to server");
      return;
    }
    socketService.requestSmokeBreak();
  }, [connectionStatus]);

  return (
    <div className={`game-table ${showSmokeEffect ? "smoke-effect" : ""}`}>
      <div className="game-content">
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
          <button
            className="stay-btn"
            onClick={handleRejoin}
            disabled={connectionStatus !== "connected" || playerStatus === "active"}
          >
            {playerStatus === "smoke_break" ? "SIT DOWN" : "REJOIN"}
          </button>
          <button
            className="bet-btn"
            onClick={handleSmokeBreak}
            disabled={connectionStatus !== "connected" || playerStatus === "smoke_break"}
          >
            {playerStatus === "smoke_break" ? "ON BREAK" : "SMOKE BREAK"}
          </button>
          <button className="exit-btn" onClick={handleExit}>
            CASH OUT
          </button>
        </div>

        {/* Status indicators */}
        <div className="status-indicators">
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === "connected" ? "Connected" : "Disconnected"}
          </div>
          {connectionError && (
            <div className="error-message">
              {connectionError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmokeBreakPage;
