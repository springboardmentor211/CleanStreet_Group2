const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  volunteerName: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);