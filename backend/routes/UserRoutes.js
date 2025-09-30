
const express = require("express");
const auth = require("../Middlewares/auth");
const User = require("../models/User");
const Complaint = require("../models/Complaint"); 
const router = express.Router();
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// USER'S COMPLAINT SUMMARY
router.get("/summary", auth(), async (req, res) => {
    try {
      const userId = req.user.id;
      const total = await Complaint.countDocuments({ user_id: userId });
      const received = await Complaint.countDocuments({ user_id: userId, status: "received" });
      const assigned = await Complaint.countDocuments({ user_id: userId, status: "assigned" });
      const in_review = await Complaint.countDocuments({ user_id: userId, status: "in_review" });
      const resolved = await Complaint.countDocuments({ user_id: userId, status: "resolved" });

      res.json({ total, received, assigned, in_review, resolved });
    } catch (err) {
      console.error("Error fetching user summary:", err);
      res.status(500).json({ msg: "Server error" });
    }
});


// GET CURRENT USER
router.get("/me", auth(), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// UPDATE PROFILE
router.put("/me", auth(), async (req, res) => {
  try {
    const { name, username, email, phone, address, bio } = req.body;
    const updated = await User.findByIdAndUpdate( req.user.id, { name, username, email, phone: phone || "", address: address || "", bio: bio || "", updatedAt: new Date() }, { new: true, runValidators: true, select: "-password -__v" } );
    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: error.message || "Failed to update profile" });
  }
});

// UPLOAD PROFILE PICTURE
router.post("/uploads-profile-picture", auth(), upload.single("profilePicture"), async (req, res) => {
    
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate( req.user.id, { profilePicture: fileUrl, updatedAt: new Date() }, { new: true, select: "-password -__v" } );
    res.json({ url: fileUrl, user: updated });
});

// REMOVE PROFILE PICTURE
router.delete("/me/profile-picture", auth(), async (req, res) => {
     const updated = await User.findByIdAndUpdate( req.user.id, { $unset: { profilePicture: "" }, $set: { updatedAt: new Date() } }, { new: true, select: "-password -__v" } );
     res.json(updated);
});

module.exports = router;