const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "volunteer", "admin"], default: "user" },
    profilePicture: { type: String ,default: null },
    
     username: { type: String,  unique: true },
     
    phone: { type: String },
    address: { type: String },
    bio: { type: String },
     
    otp: { type: String },
    otpExpires: { type: Date },
    otpVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
