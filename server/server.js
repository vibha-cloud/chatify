import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";

dotenv.config();
connectDB();
const app = express();

// Middleware to parse JSON
app.use(express.json());

// User and Chat Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// DEPLOYMENT ----->

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}

// ------------------------------

// Middleware for handling errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chatify-mern-chat-app.onrender.com",
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Setup event
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join chat event
  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log(`User ${socket.id} joined room: ${room}`);
  });

  // New message event
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat || !chat.users)
      return console.log("Chat or Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.to(user._id).emit("message received", newMessageReceived);
    });
  });

  // Typing indicator event
  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing");
  });

  // Stop typing event
  socket.on("stop typing", (chatId) => {
    socket.in(chatId).emit("stop typing");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });

  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(userData._id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.cyan.bold);
});
