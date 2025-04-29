import { io, Socket } from "socket.io-client";

// Player status type
type PlayerStatus = "active" | "smoke_break" | "pending_game_start";

// Player interface
interface Player {
  id: string;
  status: PlayerStatus;
  seat: number;
}

// Game state interface
interface GameState {
  players: Player[];
  gameStarted: boolean;
  currentHand: number;
}

// Socket events interface
interface ServerToClientEvents {
  ping: () => void;
  game_state_update: (state: GameState) => void;
  player_status_update: (playerId: string, status: PlayerStatus) => void;
  error: (error: { message: string }) => void;
}

interface ClientToServerEvents {
  pong: () => void;
  join_table: (data: { tableId: string; userId: string }) => void;
  request_smoke_break: () => void;
  request_rejoin: () => void;
  start_game: () => void;
  exit_game: () => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private missedPongs = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 2000; // 2 seconds
  private isConnecting = false;
  private currentTableId: string | null = null;
  private currentUserId: string | null = null;

  connect(tableId: string, userId: string) {
    // If already connected to the same table and user, do nothing
    if (
      this.socket?.connected &&
      this.currentTableId === tableId &&
      this.currentUserId === userId
    ) {
      console.log("Already connected to this table with the same user");
      return;
    }

    // If connecting to a different table or user, disconnect first
    if (this.socket) {
      this.disconnect();
    }

    this.currentTableId = tableId;
    this.currentUserId = userId;
    this.isConnecting = true;
    console.log("Attempting to connect to socket server...");
    const socketUrl =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";
    console.log("Socket URL:", socketUrl);

    this.socket = io(socketUrl, {
      query: { tableId, userId },
      reconnection: false, // We'll handle reconnection manually
      transports: ["websocket", "polling"],
      autoConnect: true,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully!");
      this.socket?.emit("join_table", { tableId, userId });
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      this.isConnecting = false;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );
        setTimeout(() => this.connect(tableId, userId), this.reconnectTimeout);
      } else {
        console.error(
          "Max reconnection attempts reached. Please check if the server is running."
        );
        this.disconnect();
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server initiated disconnect, don't try to reconnect
        this.disconnect();
      } else {
        // Client initiated disconnect or connection lost, try to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
          );
          setTimeout(
            () => this.connect(tableId, userId),
            this.reconnectTimeout
          );
        }
      }
    });

    this.setupListeners();
    this.startHeartbeat();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on("ping", () => {
      console.log("Received ping from server");
      this.socket?.emit("pong");
      this.missedPongs = 0;
    });

    this.socket.on("game_state_update", (state: GameState) => {
      console.log("Game state updated:", state);
    });

    this.socket.on(
      "player_status_update",
      (playerId: string, status: string) => {
        console.log(`Player ${playerId} status updated to: ${status}`);
      }
    );

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (!this.socket?.connected) {
        this.missedPongs = 0;
        return;
      }

      this.missedPongs++;
      if (this.missedPongs >= 3) {
        console.error("Connection lost - too many missed pongs");
        this.disconnect();
      }
    }, 1000);
  }

  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.currentTableId = null;
    this.currentUserId = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  requestSmokeBreak() {
    if (this.isConnected()) {
      this.socket?.emit("request_smoke_break");
    } else {
      console.error("Cannot request smoke break: Not connected to server");
    }
  }

  requestRejoin() {
    if (this.isConnected()) {
      this.socket?.emit("request_rejoin");
    } else {
      console.error("Cannot request rejoin: Not connected to server");
    }
  }

  startGame() {
    if (this.isConnected()) {
      this.socket?.emit("start_game");
    } else {
      console.error("Cannot start game: Not connected to server");
    }
  }

  exitGame() {
    if (this.isConnected()) {
      this.socket?.emit("exit_game");
    }
    this.disconnect();
  }
}

export const socketService = new SocketService();