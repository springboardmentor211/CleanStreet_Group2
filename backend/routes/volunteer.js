
const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const auth = require("../Middlewares/auth");

// Volunteer's dashboard summary statistics
router.get("/summary", auth(["volunteer"]), async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const totalAssigned = await Complaint.countDocuments({ assigned_to: volunteerId });
    const resolved = await Complaint.countDocuments({ assigned_to: volunteerId, status: "resolved" });
    const pending = await Complaint.countDocuments({ 
        assigned_to: volunteerId, 
        status: { $in: ["assigned", "in_review"] } 
    });

    res.json({ totalAssigned, resolved, pending });
  } catch (err) {
    console.error("Error in volunteer summary:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

//All complaints assigned to the logged-in volunteer
router.get("/history", auth(["volunteer"]), async (req, res) => {
  try {
    const complaints = await Complaint.find({ assigned_to: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user_id", "name"); 

    res.json(complaints);
  } catch (err) {
    console.error("Error in volunteer history:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;