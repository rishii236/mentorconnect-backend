const Doubt = require('../models/Doubt');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { emitNotification } = require('../config/socket');
const emailService = require('../services/emailServices'); // ✅ EMAIL SERVICE

// @desc    Submit a new doubt
// @route   POST /api/doubts
// @access  Private (Student)
exports.submitDoubt = async (req, res) => {
  try {
    const { mentorId, subject, remarks, meetLink } = req.body;

    // Verify mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get student info
    const student = await User.findById(req.user._id);

    // Build doubt data object
    const doubtData = {
      student: req.user._id,
      studentName: student.name,
      studentClass: student.class,
      studentCourse: student.course,
      mentor: mentorId,
      subject,
      remarks,
      meetLink
    };

    // Only add image if one was uploaded
    if (req.file && req.file.path) {
      doubtData.doubtImage = req.file.path; // Cloudinary URL
    }

    // Create doubt with optional image
    const doubt = await Doubt.create(doubtData);

    // Send notification to mentor
    const notification = {
      user: mentorId,
      type: 'doubt_submitted',
      title: 'New Doubt Submitted! 📚',
      message: `${student.name} submitted a doubt on ${subject}`,
      link: `/mentor-dashboard`
    };

    await createNotification(
      mentorId,
      notification.type,
      notification.title,
      notification.message,
      notification.link
    );

    // Emit real-time notification
    emitNotification(mentorId.toString(), notification);

    // ✅ SEND EMAIL TO MENTOR
   // ✅ SEND RESPONSE FIRST
res.status(201).json({
  success: true,
  data: doubt
});

// ✅ THEN EMAIL IN BACKGROUND
emailService.sendDoubtAssigned(doubt, mentor)
  .then(() => console.log('📧 Email sent to mentor:', mentor.email))
  .catch(err => console.error('📧 Email failed:', err.message));  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doubts for a student
// @route   GET /api/doubts/my-doubts
// @access  Private (Student)
exports.getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user._id })
      .populate('mentor', 'name subject')
      .sort('-createdAt');

    res.json({
      success: true,
      count: doubts.length,
      data: doubts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doubts for a mentor
// @route   GET /api/doubts/mentor-doubts
// @access  Private (Mentor)
exports.getMentorDoubts = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { mentor: req.user._id };
    if (status) {
      query.status = status;
    }

    const doubts = await Doubt.find(query)
      .populate('student', 'name email class course')
      .sort('-createdAt');

    res.json({
      success: true,
      count: doubts.length,
      data: doubts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doubt details
// @route   GET /api/doubts/:id
// @access  Private
exports.getDoubtById = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('student', 'name email class course')
      .populate('mentor', 'name subject expertise');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check authorization
    if (
      doubt.student._id.toString() !== req.user._id.toString() &&
      doubt.mentor._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this doubt' });
    }

    res.json({
      success: true,
      data: doubt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doubt status
// @route   PUT /api/doubts/:id/status
// @access  Private (Mentor)
exports.updateDoubtStatus = async (req, res) => {
  try {
    const { status, mentorResponse } = req.body;

    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is the assigned mentor
    if (doubt.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this doubt' });
    }

    doubt.status = status || doubt.status;
    doubt.mentorResponse = mentorResponse || doubt.mentorResponse;

    if (status === 'resolved') {
      doubt.resolvedAt = Date.now();
    }

    await doubt.save();

    // Get student and mentor info
    const student = await User.findById(doubt.student);
    const mentor = await User.findById(req.user._id);
    
    // Send notification to student
    const notification = {
      user: doubt.student,
      type: 'status_update',
      title: `Doubt ${status === 'resolved' ? 'Resolved' : 'Updated'}! 🎉`,
      message: `${mentor.name} has ${status === 'resolved' ? 'resolved' : 'updated'} your doubt on ${doubt.subject}`,
      link: `/student-dashboard`
    };

    await createNotification(
      doubt.student,
      notification.type,
      notification.title,
      notification.message,
      notification.link
    );

    // Emit real-time notification
    emitNotification(doubt.student.toString(), notification);

    // ✅ SEND EMAIL TO STUDENT IF RESOLVED
    if (status === 'resolved') {
      await emailService.sendDoubtResolved(doubt, student, mentor);
      console.log('📧 Doubt resolved email sent to student:', student.email);
    }

    res.json({
      success: true,
      data: doubt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a doubt
// @route   DELETE /api/doubts/:id
// @access  Private (Student/Admin)
exports.deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check authorization
    if (
      doubt.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this doubt' });
    }

    await doubt.deleteOne();

    res.json({
      success: true,
      message: 'Doubt removed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};