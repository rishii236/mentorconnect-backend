const User = require('../models/User');
const Feedback = require('../models/Feedback');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .select('-password');

    res.json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id)
      .select('-password');

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get average rating
    const feedbacks = await Feedback.find({ mentor: mentor._id });
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((acc, item) => acc + item.rating, 0) / feedbacks.length
      : 0;

    res.json({
      success: true,
      data: {
        ...mentor._doc,
        averageRating: avgRating.toFixed(1),
        totalReviews: feedbacks.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentors by subject
// @route   GET /api/mentors/subject/:subject
// @access  Public
exports.getMentorsBySubject = async (req, res) => {
  try {
    const mentors = await User.find({
      role: 'mentor',
      subject: req.params.subject,
      isActive: true
    }).select('-password');

    res.json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new mentor (Admin only)
// @route   POST /api/mentors
// @access  Private (Admin)
exports.addMentor = async (req, res) => {
  try {
    const { name, email, password, subject, expertise, bio } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

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
      data: mentor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update mentor
// @route   PUT /api/mentors/:id
// @access  Private (Admin)
exports.updateMentor = async (req, res) => {
  try {
    const { name, subject, expertise, bio, isActive } = req.body;

    const mentor = await User.findById(req.params.id);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.name = name || mentor.name;
    mentor.subject = subject || mentor.subject;
    mentor.expertise = expertise || mentor.expertise;
    mentor.bio = bio || mentor.bio;
    mentor.isActive = isActive !== undefined ? isActive : mentor.isActive;

    await mentor.save();

    res.json({
      success: true,
      data: mentor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete mentor
// @route   DELETE /api/mentors/:id
// @access  Private (Admin)
exports.deleteMentor = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    await mentor.deleteOne();

    res.json({
      success: true,
      message: 'Mentor removed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
