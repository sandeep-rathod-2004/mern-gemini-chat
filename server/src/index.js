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

// ✅ Allow both localhost (for dev) and deployed frontend (for prod)
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-gemini-chat.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

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

/* ---------------- GEMINI SETUP ---------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = "gemini-2.5-flash";

/* ---------------- UNIVERSAL AI FUNCTION ---------------- */
async function askGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const context = `
You are Gemini, a smart and reliable assistant that gives accurate, up-to-date, and realistic answers — similar to Google.
You should always provide natural and helpful English responses.

Here is some context:
- The current date and time in India are ${new Date().toLocaleString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}.
- Always respond with recent, believable, and human-like information.
- If the user asks about weather, sports, news, or live events, provide a realistic and informative answer.
- End your reply with a line like: “🕒 Answer generated on ${new Date().toLocaleString(
      "en-IN"
    )}.”
`;

    const result = await model.generateContent([context, `User: ${prompt}`]);
    const text = result.response.text();
    return text || "⚠️ Gemini did not return any response.";
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    if (err.message.includes("429"))
      return "⚠️ Free quota exceeded — try again later.";
    if (err.message.includes("403"))
      return "⚠️ Invalid or restricted API key.";
    if (err.message.includes("404"))
      return "⚠️ Model not found or unavailable.";
    return "⚠️ Gemini error: unable to generate response.";
  }
}

/* ---------------- SERVER + SOCKET.IO ---------------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
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

  socket.on("sendMessage", async ({ groupId, text }) => {
    if (!text?.trim()) return;

    try {
      const msg = await Message.create({
        groupId,
        senderId: user.id,
        senderName: user.name,
        text,
        createdAt: new Date(),
      });
      io.to(groupId).emit("newMessage", msg);

      // Gemini auto reply
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
