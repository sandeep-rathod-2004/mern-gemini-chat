import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

import User from "./models/User.js";
import Group from "./models/Group.js";
import Message from "./models/Message.js";
import authRoutes from "./routes/auth.js";
import groupsRoutes from "./routes/groups.js";
import messagesRoutes from "./routes/messages.js";

dotenv.config();

/* ---------------- EXPRESS SETUP ---------------- */
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

/* ---------------- MONGODB ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/messages", messagesRoutes);
app.get("/api/health", (_, res) => res.json({ ok: true }));

/* ---------------- GEMINI SETUP (Free Tier) ---------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const validGeminiModel = "gemini-2.5-flash"; // Free tier model

async function askGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: validGeminiModel });
    const result = await model.generateContent(prompt);
    return result.response.text() || "⚠️ Gemini returned no response.";
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    if (err.message.includes("429"))
      return "⚠️ Free quota exceeded — try again later today.";
    if (err.message.includes("403"))
      return "⚠️ Invalid or restricted API key.";
    if (err.message.includes("404"))
      return "⚠️ Model not found. Verify your model name.";
    return "⚠️ Gemini error: unable to generate a response.";
  }
}

/* ---------------- SERVER + SOCKET.IO ---------------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

/* ---------------- JWT VERIFY ---------------- */
function verifyToken(token) {
  try {
    if (!token) return null;
    token = token.replace(/^"|"$/g, "");
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log("JWT verify error:", err.message);
    return null;
  }
}

/* ---------------- SOCKET.IO ---------------- */
io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  const user = verifyToken(token);

  if (!user || !user.id) {
    console.log("❌ Unauthorized socket connection:", socket.id);
    socket.disconnect(true);
    return;
  }

  socket.data.user = user;
  console.log(`🟢 Socket connected: ${socket.id}, user: ${user.name}`);

  // Join a chat group
  socket.on("joinRoom", async ({ groupId }) => {
    if (!groupId) return;
    socket.join(groupId);

    try {
      const messages = await Message.find({ groupId })
        .sort({ createdAt: 1 })
        .limit(1000);
      socket.emit("previousMessages", messages);
      socket.to(groupId).emit("userJoined", { user: user.name });
    } catch (err) {
      console.error("fetch messages error:", err);
    }
  });

  // Handle new message
  socket.on("sendMessage", async ({ groupId, text }) => {
    if (!text?.trim()) return;

    try {
      // Save user message
      const msg = await Message.create({
        groupId,
        senderId: user.id,
        senderName: user.name,
        text,
        createdAt: new Date(),
      });
      io.to(groupId).emit("newMessage", msg);

      // Gemini auto-reply (only if message starts with @gemini)
      if (text.toLowerCase().startsWith("@gemini ")) {
        const prompt = text.replace(/@gemini /gi, "").trim();
        const reply = await askGemini(prompt);

        const aiMsg = await Message.create({
          groupId,
          senderId: "gemini",
          senderName: "Gemini AI",
          text: reply,
          createdAt: new Date(),
        });
        io.to(groupId).emit("newMessage", aiMsg);
      }
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("error", { message: "message_failed" });
    }
  });

  socket.on("disconnect", () =>
    console.log(`🔴 Socket disconnected: ${socket.id}`)
  );
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
