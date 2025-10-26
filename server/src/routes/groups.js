import express from "express";
import Group from "../models/Group.js";
import Message from "../models/Message.js";

const router = express.Router();

/* List all groups */
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().sort({ name: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* Create a new group */
router.post("/", async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const exists = await Group.findOne({ slug });
    if (exists)
      return res.status(400).json({ success: false, message: "Slug already exists" });

    const group = await Group.create({ name, slug });

    res.json({
      success: true,
      message: `New group created: ${name}. Group ID: ${slug}`,
      group
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* Join group by slug (ID) and get previous messages */
router.get("/join/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findOne({ slug });
    if (!group)
      return res.status(404).json({ success: false, message: "Group not found" });

    const messages = await Message.find({ groupId: slug })
      .sort({ createdAt: 1 })
      .limit(1000);

    res.json({ success: true, group, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
