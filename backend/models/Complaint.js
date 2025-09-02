const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: String,
  location_coords: String,
  address: String,
  assigned_to: { type: String, default: null },
  status: { type: String, enum: ["received", "in_review", "resolved"], default: "received" },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
