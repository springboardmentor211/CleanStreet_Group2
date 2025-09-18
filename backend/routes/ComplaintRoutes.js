
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Complaint = require("../models/Complaint");
const auth = require("../Middlewares/auth");

const router = express.Router();

// ----------------- File Upload Setup -----------------
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ----------------- ROUTES -----------------

// POST: Create a new complaint
router.post("/", auth(), upload.array("images"), async (req, res) => {
  try {
    const { lat, lng, ...otherFields } = req.body;

    const complaint = new Complaint({
      user_id: req.user.id,
      ...otherFields,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)], // [lng, lat]
      },
      images: req.files.map((file) => file.filename),
    });

    await complaint.save();
    res.json({ success: true, msg: "Complaint submitted", complaint });
  } catch (err) {
    console.error("Error saving complaint:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});

// GET: Complaints created by logged-in user
router.get("/my", auth(), async (req, res) => {
  try {
    const complaints = await Complaint.find({ user_id: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({ msg: "Error fetching your complaints" });
  }
});

//  GET: All complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ msg: "Error fetching complaints" });
  }
});

//  GET: Complaint by ID
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    console.error("Error fetching complaint:", err);
    res.status(500).json({ msg: "Error fetching complaint details" });
  }
});

// DELETE: Only owner can delete
router.delete("/:id", auth(), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    if (complaint.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to delete this complaint" });
    }

    // Remove images from uploads folder
    if (complaint.images && complaint.images.length > 0) {
      complaint.images.forEach((file) => {
        const filePath = path.join(uploadDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await complaint.deleteOne();

    res.json({ success: true, msg: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(500).json({ msg: "Error deleting complaint" });
  }
});

  // POST: Add comment
router.post("/:id/comment", auth(), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    const comment = {
      text: req.body.text,
      author: req.user.name,
      user_id: req.user.id,
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
    };

    complaint.comments.push(comment);
    await complaint.save();

    res.json(complaint.comments[complaint.comments.length - 1]);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ msg: "Error adding comment" });
  }
});

//  POST: Vote complaint
router.post("/:id/vote", auth(), async (req, res) => {
  try {
    const { voteType } = req.body;
    const userId = req.user.id;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    // Remove previous vote
    complaint.upvotedBy = complaint.upvotedBy.filter((id) => id.toString() !== userId);
    complaint.downvotedBy = complaint.downvotedBy.filter((id) => id.toString() !== userId);

    if (voteType === "upvote") complaint.upvotedBy.push(userId);
    if (voteType === "downvote") complaint.downvotedBy.push(userId);

    complaint.upvotes = complaint.upvotedBy.length;
    complaint.downvotes = complaint.downvotedBy.length;

    await complaint.save();

    res.json({
      upvotes: complaint.upvotes,
      downvotes: complaint.downvotes,
      userVote: voteType,
    });
  } catch (err) {
    console.error("Error voting:", err);
    res.status(500).json({ msg: "Error voting" });
  }
});

//  POST: Vote comment
router.post("/:id/comments/:commentId/vote", auth(), async (req, res) => {
  try {
    const { voteType } = req.body;
    const userId = req.user.id;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    const comment = complaint.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Remove previous vote
    comment.upvotedBy = comment.upvotedBy.filter((id) => id.toString() !== userId);
    comment.downvotedBy = comment.downvotedBy.filter((id) => id.toString() !== userId);

    if (voteType === "upvote") comment.upvotedBy.push(userId);
    if (voteType === "downvote") comment.downvotedBy.push(userId);

    comment.upvotes = comment.upvotedBy.length;
    comment.downvotes = comment.downvotedBy.length;

    await complaint.save();

    res.json({
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      userVote: voteType,
    });
  } catch (err) {
    console.error("Error voting on comment:", err);
    res.status(500).json({ msg: "Error voting on comment" });
  }
});


module.exports = router;
