<<<<<<< HEAD
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

=======
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

>>>>>>> c7c79f83b9ea2a9441f404964b22d40eb15a741f
module.exports = router;