const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "CoolMeet signaling server", uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update this in production
    methods: ["GET", "POST"],
  },
});

let pubClient, subClient, redisClient;
if (process.env.REDIS_URL) {
  pubClient = new Redis(process.env.REDIS_URL);
  subClient = new Redis(process.env.REDIS_URL);
  redisClient = new Redis(process.env.REDIS_URL);
} else {
  const redisHost = process.env.REDIS_HOST || "127.0.0.1";
  const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
  pubClient = new Redis({ host: redisHost, port: redisPort });
  subClient = new Redis({ host: redisHost, port: redisPort });
  redisClient = new Redis({ host: redisHost, port: redisPort });
}

io.adapter(createAdapter(pubClient, subClient));

const WAITING_USERS_KEY = "waiting_users";

// Continuous worker to process matchmaking queue
setInterval(async () => {
  try {
    const queueSize = await redisClient.llen(WAITING_USERS_KEY);
    if (queueSize >= 2) {
      // Pop two users atomically
      const user1 = await redisClient.rpop(WAITING_USERS_KEY);
      const user2 = await redisClient.rpop(WAITING_USERS_KEY);

      if (user1 && user2) {
        const roomId = uuidv4();
        
        // Notify both users that a match was found
        io.to(user1).emit("match_found", { roomId, peerId: user2, initiator: true });
        io.to(user2).emit("match_found", { roomId, peerId: user1, initiator: false });
        
        console.log(`Matched ${user1} and ${user2} in room ${roomId}`);
      } else {
        // In case of a race condition and one wasn't popped, push back
        if (user1) await redisClient.lpush(WAITING_USERS_KEY, user1);
        if (user2) await redisClient.lpush(WAITING_USERS_KEY, user2);
      }
    }
  } catch (error) {
    console.error("Matchmaking error:", error);
  }
}, 1000); // Check every second

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("start_matchmaking", async () => {
    // Add user to the waiting queue
    await redisClient.lpush(WAITING_USERS_KEY, socket.id);
    console.log(`${socket.id} joined the matchmaking queue`);
  });

  socket.on("stop_matchmaking", async () => {
    // Remove user from queue
    await redisClient.lrem(WAITING_USERS_KEY, 0, socket.id);
    console.log(`${socket.id} left the matchmaking queue`);
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  // WebRTC Signaling Events
  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", {
      sdp: data.sdp,
      senderId: socket.id,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", {
      sdp: data.sdp,
      senderId: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", {
      candidate: data.candidate,
      senderId: socket.id,
    });
  });
  
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peer_left", socket.id);
  });

  socket.on("chat_message", (data) => {
    socket.to(data.roomId).emit("chat_message", {
      text: data.text,
      senderId: socket.id,
    });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    await redisClient.lrem(WAITING_USERS_KEY, 0, socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
