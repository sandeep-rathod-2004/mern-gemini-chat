// server/src/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  senderId: { type: String },
  senderName: { type: String },
  text: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
