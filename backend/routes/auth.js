const express = require("express");
const router = express.Router();
const User = require("../models/User");
const axios = require("axios");

// GOOGLE LOGIN
router.post("/google", async (req, res) => {
  const { token } = req.body;
  
  try {
    // 1. Get user info from Google
    const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const { email, name, picture, sub: googleId } = googleRes.data;

    if (!email) {
      return res.status(400).json({ success: true, message: "Google Auth fail" });
    }

    // 2. Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ 
        email, 
        googleId,
        name,
        avatar: picture
      });
      await user.save();
    }

    res.json({ 
      success: true, 
      message: "Google login successful", 
      user: { 
        id: user._id, 
        email: user.email,
        name: user.name || email.split('@')[0],
        favorites: [],
        playlists: []
      },
      token: "dummy-session-token"
    });

  } catch (error) {
    console.error("Google Auth Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// SIGNUP
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const user = new User({ email, password });
  await user.save();

  res.json({ message: "Signup success" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json({ message: "User not found" });

  if (user.password !== password) {
    return res.json({ message: "Wrong password" });
  }

  res.json({ message: "Login success", user });
});

module.exports = router;