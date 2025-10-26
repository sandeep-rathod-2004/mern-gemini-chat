// server/src/models/Group.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);
