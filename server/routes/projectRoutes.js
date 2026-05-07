const express = require('express');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    // Admins see all projects, Members only see projects they are added to
    const query = req.user.role === 'Admin' ? {} : { members: req.user.userId };
    const projects = await Project.find(query).populate('createdBy', 'name').populate('members', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a project (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({ 
      name, 
      description, 
      createdBy: req.user.userId,
      members 
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all members assigned to a specific project
router.get('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project.members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a member to an existing project (Admin Only)
router.patch('/:id/members', protect, adminOnly, async (req, res) => {
  try {
    const { newMemberId } = req.body;
    
    // $addToSet safely adds the user ONLY if they aren't already in the array
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: newMemberId } },
      { new: true }
    );
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Member added successfully', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;