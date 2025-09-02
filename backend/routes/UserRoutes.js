const express = require("express");
const auth = require("../Middlewares/auth");
const User = require("../models/User");
const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`[UserRoutes] ${req.method} ${req.originalUrl}`);
  console.log('Request headers:', req.headers);
  next();
});

router.get("/me", auth(), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.put("/me", auth(), async (req, res) => {
  try {
    console.log('Update request received for user:', req.user.id);
    console.log('Update data:', req.body);

    const { name, username, email, phone, address, bio } = req.body;

    // Find the user first to verify existence
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Check for email uniqueness if email is being changed
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Check for username uniqueness if username is being changed
    if (username !== existingUser.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name, 
        username, 
        email, 
        phone: phone || '',
        address: address || '',
        bio: bio || '',
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true,
        select: '-password -__v'
      });

    console.log('User updated successfully:', updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ 
      message: error.message || "Failed to update profile",
      details: error.toString()
    });
  }
});

// Route to remove profile picture
router.delete("/me/profile-picture", auth(), async (req, res) => {
  try {
    console.log('Attempting to remove profile picture for user:', req.user.id);
    console.log('User object from request:', req.user);

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('Current user data:', user);

    // First try to verify if the user has a profile picture
    if (!user.profilePicture) {
      console.log('No profile picture to remove');
      return res.status(400).json({ message: "No profile picture to remove" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $unset: { profilePicture: "" },
        $set: { updatedAt: new Date() }
      },
      { 
        new: true,
        runValidators: true,
        select: '-password -__v'
      });
    
    if (!updated) {
      console.log('Update failed - no document returned');
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    console.log('Profile picture removed successfully:', updated);
    res.json(updated);
  } catch (error) {
    console.error('Error removing profile picture:', error);
    res.status(500).json({ 
      message: "Failed to remove profile picture",
      error: error.message 
    });
  }
});

module.exports = router;
