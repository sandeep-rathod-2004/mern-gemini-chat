// server/src/routes/messages.js
import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/* GET messages for a group */
router.get("/:groupId", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId }).sort({ createdAt: 1 }).limit(1000);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
