
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Complaint = require("../models/Complaint");
const auth = require("../Middlewares/auth");

const router = express.Router();

// Create uploads folder if not exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


 //POST - Add new complaint
 //Requires authentication
router.post("/", auth(), upload.array("images"), async (req, res) => {
  try {
    const complaintData = {
      user_id: req.user.id, // from auth middleware
      ...req.body,
      images: req.files.map((file) => file.filename),
    };

    const complaint = new Complaint(complaintData);
    await complaint.save();

    res.json({ success: true, msg: "Complaint submitted", complaint });
  } catch (err) {
    console.error("Error saving complaint:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});


//  GET - Fetch all complaints (Admin use)
 
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching complaints" });
  }
});

// GET - Fetch complaints of logged-in user
 
router.get("/my", auth(), async (req, res) => {
  try {
    const complaints = await Complaint.find({ user_id: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching your complaints" });
  }
});

module.exports = router;
