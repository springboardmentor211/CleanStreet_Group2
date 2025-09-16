
const mongoose = require("mongoose");

// Comment Schema
const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// Complaint Schema
const ComplaintSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  issueType: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  description: { type: String, required: true },
  address: { type: String, required: true },
  landmark: { type: String },
    location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      default : undefined
    }
  },
  images: [String],
  assigned_to: { type: String, default: null },
  status: { type: String, enum: ["received", "in_review", "resolved"], default: "received" },
  comments: [CommentSchema],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

// ✅ Added geospatial index for queries
ComplaintSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Complaint", ComplaintSchema);
