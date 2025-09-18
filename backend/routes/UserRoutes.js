
const express = require("express");
const auth = require("../Middlewares/auth");
const User = require("../models/User");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ----------------- MULTER CONFIG -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ----------------- DEBUG MIDDLEWARE -----------------
router.use((req, res, next) => {
  console.log(`[UserRoutes] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  next();
});

// ----------------- GET CURRENT USER -----------------
router.get("/me", auth(), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// ----------------- UPDATE PROFILE -----------------
router.put("/me", auth(), async (req, res) => {
  try {
    console.log("Update request for:", req.user.id, req.body);

    const { name, username, email, phone, address, bio } = req.body;

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    // Ensure email is unique
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
    }

    // Ensure username is unique
    if (username !== existingUser.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (usernameExists) return res.status(400).json({ message: "Username already in use" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        username,
        email,
        phone: phone || "",
        address: address || "",
        bio: bio || "",
        updatedAt: new Date()
      },
      { new: true, runValidators: true, select: "-password -__v" }
    );

    console.log("User updated:", updated);
    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: error.message || "Failed to update profile" });
  }
});

// ----------------- UPLOAD PROFILE PICTURE -----------------
router.post(
  "/uploads-profile-picture",
  auth(),
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      // Build public URL
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      const updated = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: fileUrl, updatedAt: new Date() },
        { new: true, select: "-password -__v" }
      );

      console.log("Profile picture uploaded:", fileUrl);
      res.json({ url: fileUrl, user: updated });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  }
);

// ----------------- REMOVE PROFILE PICTURE -----------------
router.delete("/me/profile-picture", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.profilePicture || user.profilePicture === "") {
      return res.status(400).json({ message: "No profile picture to remove" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { profilePicture: "" }, $set: { updatedAt: new Date() } },
      { new: true, select: "-password -__v" }
    );

    console.log("Profile picture removed");
    res.json(updated);
  } catch (error) {
    console.error("Error removing profile picture:", error);
    res.status(500).json({ message: "Failed to remove profile picture" });
  }
});

module.exports = router;
