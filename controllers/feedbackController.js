const Feedback = require('../models/Feedback');
const Doubt = require('../models/Doubt');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const emailService = require('../services/emailServices'); // ✅ EMAIL SERVICE

// @desc    Submit feedback/rating for mentor
// @route   POST /api/feedback
// @access  Private (Student)
exports.submitFeedback = async (req, res) => {
  try {
    const { mentorId, doubtId, appointmentId, rating, comment, tags } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get student info
    const student = await User.findById(req.user._id);

    // Check if feedback already exists for this doubt/appointment
    if (doubtId) {
      const existing = await Feedback.findOne({ 
        student: req.user._id, 
        doubt: doubtId 
      });
      if (existing) {
        return res.status(400).json({ message: 'Feedback already submitted for this doubt' });
      }
    }

    if (appointmentId) {
      const existing = await Feedback.findOne({ 
        student: req.user._id, 
        appointment: appointmentId 
      });
      if (existing) {
        return res.status(400).json({ message: 'Feedback already submitted for this appointment' });
      }
    }

    // Create feedback
    const feedback = await Feedback.create({
      student: req.user._id,
      mentor: mentorId,
      doubt: doubtId,
      appointment: appointmentId,
      rating,
      comment,
      tags: tags || []
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('student', 'name')
      .populate('mentor', 'name subject');

    // ✅ SEND EMAIL TO MENTOR
    await emailService.sendFeedbackNotification(feedback, mentor, student);
    console.log('📧 Feedback notification email sent to mentor:', mentor.email);

    res.status(201).json({
      success: true,
      data: populatedFeedback,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback for a mentor
// @route   GET /api/feedback/mentor/:mentorId
// @access  Public
exports.getMentorFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ mentor: req.params.mentorId })
      .populate('student', 'name')
      .populate('doubt', 'subject')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ mentor: req.params.mentorId });

    // Calculate average rating
    const stats = await Feedback.aggregate([
      { $match: { mentor: req.params.mentorId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].ratings.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      stats: {
        avgRating: stats[0]?.avgRating || 0,
        totalFeedback: stats[0]?.totalFeedback || 0,
        ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my feedback (as student)
// @route   GET /api/feedback/my-feedback
// @access  Private (Student)
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.user._id })
      .populate('mentor', 'name subject')
      .populate('doubt', 'subject')
      .populate('appointment')
      .sort('-createdAt');

    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback received (as mentor)
// @route   GET /api/feedback/received
// @access  Private (Mentor)
exports.getFeedbackReceived = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ mentor: req.user._id })
      .populate('student', 'name class course')
      .populate('doubt', 'subject')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ mentor: req.user._id });

    // Get rating stats
    const stats = await Feedback.aggregate([
      { $match: { mentor: req.user._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    // Get tag frequency
    const tagStats = await Feedback.aggregate([
      { $match: { mentor: req.user._id } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      },
      stats: {
        avgRating: stats[0]?.avgRating || 0,
        totalFeedback: stats[0]?.totalFeedback || 0,
        topTags: tagStats.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Student - own feedback only)
exports.updateFeedback = async (req, res) => {
  try {
    const { rating, comment, tags } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check ownership
    if (feedback.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }

    // Update fields
    if (rating) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    if (tags) feedback.tags = tags;

    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('student', 'name')
      .populate('mentor', 'name subject');

    res.json({
      success: true,
      data: updatedFeedback,
      message: 'Feedback updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Student - own feedback only)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check ownership
    if (feedback.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};