const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store game state
const gameState = {
  players: {},
  gameStarted: false,
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle initial connection with tableId and userId
  socket.on("join_table", ({ tableId, userId }) => {
    socket.join(tableId);
    gameState.players[socket.id] = {
      id: userId,
      status: "pending_game_start",
      tableId,
    };
    io.to(tableId).emit("game_state_update", gameState);
  });

  // Handle smoke break request
  socket.on("request_smoke_break", () => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].status = "smoke_break";
      io.to(gameState.players[socket.id].tableId).emit(
        "game_state_update",
        gameState
      );
    }
  });

  // Handle rejoin request
  socket.on("request_rejoin", () => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].status = "active";
      io.to(gameState.players[socket.id].tableId).emit(
        "game_state_update",
        gameState
      );
    }
  });

  // Handle game start
  socket.on("start_game", () => {
    const tableId = gameState.players[socket.id]?.tableId;
    if (tableId) {
      gameState.gameStarted = true;
      io.to(tableId).emit("game_state_update", gameState);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (gameState.players[socket.id]) {
      const tableId = gameState.players[socket.id].tableId;
      delete gameState.players[socket.id];
      io.to(tableId).emit("game_state_update", gameState);
    }
  });

  // Send heartbeat every 2 seconds
  setInterval(() => {
    socket.emit("ping");
  }, 2000);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
