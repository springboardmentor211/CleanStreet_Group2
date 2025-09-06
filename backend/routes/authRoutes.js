const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();


const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/User");



router.post("/register", register);
router.post("/login", login);



/**
 * POST /auth/send-otp
 * Send OTP to user's email
 */
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB (expires in 5 mins)
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;
    await user.save();

    // Send email with Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Clean Street" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ msg: "OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /auth/verify-otp
 * Verify user's OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.otpVerified = true;
    await user.save();

    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /auth/reset-password
 * Reset password if OTP verified
 */
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otpVerified) {
      return res.status(400).json({ msg: "OTP not verified" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpVerified = false;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
