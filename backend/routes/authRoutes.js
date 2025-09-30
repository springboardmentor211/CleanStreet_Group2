
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const auth = require("../Middlewares/auth");

const router = express.Router();

// -------------------- REGISTER --------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, username } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email, and password are required" });
    }

    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists with this email" });

    
    let finalUsername = username && username.trim() !== "" ? username.trim() : undefined;
    if (finalUsername) {
      const existingUsername = await User.findOne({ username: finalUsername });
      if (existingUsername) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      username: finalUsername
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = await User.findById(user._id).select("-password -__v");
    res.status(201).json({ token, user: safeUser });

  } catch (err) {
    console.error("Error in /register:", err);
    
    if (err.code === 11000) {
      return res.status(400).json({ msg: `Duplicate value: ${JSON.stringify(err.keyValue)}` });
    }

    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = await User.findById(user._id).select("-password -__v");
    res.json({ token, user: safeUser });

  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------- GET CURRENT USER --------------------
router.get("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------- SEND OTP --------------------
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;
    await user.save();

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
    console.error("Error in /send-otp:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------- VERIFY OTP --------------------
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
    console.error("Error in /verify-otp:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------- RESET PASSWORD --------------------
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otpVerified) {
      return res.status(400).json({ msg: "OTP not verified" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpVerified = false;
    await user.save();

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    console.error("Error in /reset-password:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
