
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    issueType: { type: String, required: true },   // pothole, water leak, etc.
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
    description: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String },
    location: { type: String },   // you can also store { lat, lng } as Object
    images: [String],             // array of uploaded image filenames
    assigned_to: { type: String, default: null },
    status: { 
      type: String, 
      enum: ["received", "in_review", "resolved"], 
      default: "received" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
