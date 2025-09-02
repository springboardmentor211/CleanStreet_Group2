const express = require("express");
const auth = require("../Middlewares/auth");
const Complaint = require("../models/Complaint");
const router = express.Router();

// Get my complaints
router.get("/my", auth(), async (req, res) => {
  const complaints = await Complaint.find({ user_id: req.user.id });
  res.json(complaints);
});

module.exports = router;
