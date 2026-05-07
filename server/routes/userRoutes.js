const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get all users (so Admin can assign tasks)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords!
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;