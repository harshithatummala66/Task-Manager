const express = require('express');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get tasks assigned specifically to the logged-in user
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId }).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific project
router.get('/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a task (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    // 🚨 Make sure 'dueDate' is extracted from req.body
    const { title, project, assignedTo, dueDate } = req.body; 
    
    const task = await Task.create({ 
      title, 
      project, 
      assignedTo, 
      dueDate // 🚨 Make sure it's passed here
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;