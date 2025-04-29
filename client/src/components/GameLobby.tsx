import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { socketService } from "../services/socketService";

type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface GameLobbyProps {
  isHost: boolean;
  tableId: string;
  onStartGame?: () => void;
  onRejoin?: () => void;
  onExit?: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  isHost,
  tableId,
  onStartGame,
  onRejoin,
  onExit,
}) => {
  const navigate = useNavigate();
  const [showShareLink, setShowShareLink] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const gameUrl = `${window.location.origin}/table/${tableId}`;

  const checkConnection = useCallback(() => {
    if (socketService.isConnected()) {
      setConnectionStatus("connected");
      setConnectionError(null);
    } else {
      setConnectionStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    // Check connection status every second
    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [checkConnection]);

  const handleShare = useCallback(() => {
    setShowShareLink(true);
    navigator.clipboard.writeText(gameUrl).catch((error) => {
      console.error("Failed to copy to clipboard:", error);
    });
  }, [gameUrl]);

  const handleStartGame = useCallback(() => {
    if (connectionStatus !== "connected") {
      setConnectionError("Cannot start game: Not connected to server");
      return;
    }
    onStartGame?.();
  }, [connectionStatus, onStartGame]);

  const handleRejoin = useCallback(() => {
    if (connectionStatus !== "connected") {
      setConnectionError("Cannot rejoin: Not connected to server");
      return;
    }
    onRejoin?.();
  }, [connectionStatus, onRejoin]);

  const handleExit = useCallback(() => {
    onExit?.();
    navigate("/");
  }, [onExit, navigate]);

  return (
    <div className="game-lobby">
      {/* Add decorative card suits to the background */}
      <div className="card-suits">
        <span className="suit">♠</span>
        <span className="suit">♥</span>
        <span className="suit">♣</span>
        <span className="suit">♦</span>
      </div>

      <div className="lobby-content">
        <h1 className="lobby-title">Smoke Break Lobby</h1>
        <div
          className={`connection-status ${connectionStatus}`}
          role="status"
          aria-live="polite"
        >
          {connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </div>

        {connectionError && (
          <div className="error-message" role="alert">
            {connectionError}
          </div>
        )}

        <div className="table-info">
          <h2>Table ID: {tableId}</h2>
          <p>Scan QR code or share link to invite players</p>
        </div>

        <div className="qr-container">
          <QRCodeSVG
            value={gameUrl}
            size={200}
            level="H"
            includeMargin={true}
            bgColor={"#FFFFFF"}
            fgColor={"#2c3e50"}
          />
        </div>

        <div className="lobby-buttons">
          {isHost && (
            <button
              className="start-game-btn"
              onClick={handleStartGame}
              disabled={connectionStatus !== "connected"}
              aria-disabled={connectionStatus !== "connected"}
            >
              Start Game
            </button>
          )}

          <button
            className="rejoin-btn"
            onClick={handleRejoin}
            disabled={connectionStatus !== "connected"}
            aria-disabled={connectionStatus !== "connected"}
          >
            Rejoin Game
          </button>

          <button className="share-btn" onClick={handleShare}>
            Share Table
          </button>

          <button className="exit-btn" onClick={handleExit}>
            Exit Lobby
          </button>
        </div>

        {showShareLink && (
          <div className="share-link-popup" role="alert">
            <p>Link copied to clipboard!</p>
            <button onClick={() => setShowShareLink(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;