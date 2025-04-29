const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Add root route handler
app.get("/", (req, res) => {
  res.json({ message: "Socket server is running" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  transports: ["websocket", "polling"],
});

// Store game state
const gameState = {
  players: {},
  gameStarted: false,
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle initial connection with tableId and userId
  socket.on("join_table", ({ tableId, userId }) => {
    try {
      // Check if user is already in the table
      const existingPlayer = Object.values(gameState.players).find(
        (player) => player.id === userId && player.tableId === tableId
      );

      if (existingPlayer) {
        console.log(`User ${userId} already in table ${tableId}`);
        return;
      }

      socket.join(tableId);
      gameState.players[socket.id] = {
        id: userId,
        status: "pending_game_start",
        tableId,
      };
      io.to(tableId).emit("game_state_update", gameState);
    } catch (error) {
      console.error("Error in join_table:", error);
      socket.emit("error", { message: "Failed to join table" });
    }
  });

  // Handle smoke break request
  socket.on("request_smoke_break", () => {
    try {
      if (gameState.players[socket.id]) {
        gameState.players[socket.id].status = "smoke_break";
        io.to(gameState.players[socket.id].tableId).emit(
          "game_state_update",
          gameState
        );
      }
    } catch (error) {
      console.error("Error in request_smoke_break:", error);
      socket.emit("error", {
        message: "Failed to process smoke break request",
      });
    }
  });

  // Handle rejoin request
  socket.on("request_rejoin", () => {
    try {
      if (gameState.players[socket.id]) {
        gameState.players[socket.id].status = "active";
        io.to(gameState.players[socket.id].tableId).emit(
          "game_state_update",
          gameState
        );
      }
    } catch (error) {
      console.error("Error in request_rejoin:", error);
      socket.emit("error", { message: "Failed to process rejoin request" });
    }
  });

  // Handle game start
  socket.on("start_game", () => {
    try {
      const tableId = gameState.players[socket.id]?.tableId;
      if (tableId) {
        gameState.gameStarted = true;
        io.to(tableId).emit("game_state_update", gameState);
      }
    } catch (error) {
      console.error("Error in start_game:", error);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    try {
      if (gameState.players[socket.id]) {
        const tableId = gameState.players[socket.id].tableId;
        delete gameState.players[socket.id];
        io.to(tableId).emit("game_state_update", gameState);
      }
    } catch (error) {
      console.error("Error in disconnect handler:", error);
    }
  });

  // Send heartbeat every 2 seconds
  const heartbeatInterval = setInterval(() => {
    try {
      socket.emit("ping");
    } catch (error) {
      console.error("Error in heartbeat:", error);
      clearInterval(heartbeatInterval);
    }
  }, 2000);

  // Clean up interval on disconnect
  socket.on("disconnect", () => {
    clearInterval(heartbeatInterval);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
