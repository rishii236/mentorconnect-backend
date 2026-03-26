const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalDoubts = await Doubt.countDocuments();
    const resolvedDoubts = await Doubt.countDocuments({ status: 'resolved' });

    res.json({
      success: true,
      data: {
        totalMentors,
        totalStudents,
        totalDoubts,
        resolvedDoubts
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// @route   GET /api/admin/mentors
// @desc    Get all mentors
// @access  Private/Admin
router.get('/mentors', protect, authorize('admin'), async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('-password');
    
    res.json({
      success: true,
      data: mentors
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors'
    });
  }
});

// @route   POST /api/admin/mentor
// @desc    Add a new mentor
// @access  Private/Admin
router.post('/mentor', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, subject, expertise, bio } = req.body;

    // Check if mentor already exists
    const mentorExists = await User.findOne({ email });
    if (mentorExists) {
      return res.status(400).json({
        success: false,
        message: 'Mentor with this email already exists'
      });
    }

    // Create mentor
    const mentor = await User.create({
      name,
      email,
      password,
      role: 'mentor',
      subject,
      expertise,
      bio
    });

    res.status(201).json({
      success: true,
      data: {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        subject: mentor.subject,
        expertise: mentor.expertise,
        bio: mentor.bio
      },
      message: 'Mentor created successfully'
    });
  } catch (error) {
    console.error('Error creating mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mentor'
    });
  }
});

// @route   DELETE /api/admin/mentor/:id
// @desc    Delete a mentor
// @access  Private/Admin
router.delete('/mentor/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    if (mentor.role !== 'mentor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a mentor'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mentor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mentor'
    });
  }
});

module.exports = router;