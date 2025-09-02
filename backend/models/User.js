const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "volunteer", "admin"], default: "user" },
    profilePicture: { type: String },
    username: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    bio: { type: String }
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
