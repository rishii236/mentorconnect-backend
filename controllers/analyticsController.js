const Doubt = require('../models/Doubt');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');

// @desc    Get admin analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res) => {
  try {
    // Total counts
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalMentors = await User.countDocuments({ role: 'mentor', isActive: true });
    const totalDoubts = await Doubt.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    // Doubt status breakdown
    const doubtsByStatus = await Doubt.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Doubts by subject
    const doubtsBySubject = await Doubt.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top mentors by resolved doubts
    const topMentors = await Doubt.aggregate([
      { $match: { status: 'resolved' } },
      {
        $group: {
          _id: '$mentor',
          resolvedCount: { $sum: 1 }
        }
      },
      { $sort: { resolvedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'mentorInfo'
        }
      },
      { $unwind: '$mentorInfo' },
      {
        $project: {
          name: '$mentorInfo.name',
          subject: '$mentorInfo.subject',
          resolvedCount: 1
        }
      }
    ]);

    // Average rating per mentor
    const mentorRatings = await Feedback.aggregate([
      {
        $group: {
          _id: '$mentor',
          avgRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'mentorInfo'
        }
      },
      { $unwind: '$mentorInfo' },
      {
        $project: {
          name: '$mentorInfo.name',
          subject: '$mentorInfo.subject',
          avgRating: { $round: ['$avgRating', 2] },
          totalFeedback: 1
        }
      }
    ]);

    // Doubts trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const doubtsTrend = await Doubt.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Resolution time average
    const avgResolutionTime = await Doubt.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalMentors,
          totalDoubts,
          totalAppointments
        },
        doubtsByStatus,
        doubtsBySubject,
        topMentors,
        mentorRatings,
        doubtsTrend,
        avgResolutionTime: avgResolutionTime[0]?.avgHours || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentor analytics
// @route   GET /api/analytics/mentor
// @access  Private (Mentor)
exports.getMentorAnalytics = async (req, res) => {
  try {
    // Total doubts assigned
    const totalDoubts = await Doubt.countDocuments({ mentor: req.user._id });

    // Doubts by status
    const doubtsByStatus = await Doubt.aggregate([
      { $match: { mentor: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average rating
    const ratingStats = await Feedback.aggregate([
      { $match: { mentor: req.user._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    // Recent feedback
    const recentFeedback = await Feedback.find({ mentor: req.user._id })
      .populate('student', 'name')
      .populate('doubt', 'subject')
      .sort('-createdAt')
      .limit(5);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Doubt.aggregate([
      { $match: { mentor: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({
      mentor: req.user._id
    });

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      mentor: req.user._id,
      appointmentDate: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('student', 'name email')
      .sort('appointmentDate')
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalDoubts,
          totalAppointments,
          avgRating: ratingStats[0]?.avgRating || 0,
          totalFeedback: ratingStats[0]?.totalFeedback || 0
        },
        doubtsByStatus,
        monthlyTrend,
        recentFeedback,
        upcomingAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
exports.getStudentAnalytics = async (req, res) => {
  try {
    // Total doubts submitted
    const totalDoubts = await Doubt.countDocuments({ student: req.user._id });

    // Doubts by status
    const doubtsByStatus = await Doubt.aggregate([
      { $match: { student: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Doubts by subject
    const doubtsBySubject = await Doubt.aggregate([
      { $match: { student: req.user._id } },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({
      student: req.user._id
    });

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      student: req.user._id,
      appointmentDate: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('mentor', 'name subject')
      .sort('appointmentDate')
      .limit(5);

    // Feedback given
    const feedbackGiven = await Feedback.countDocuments({ student: req.user._id });

    res.json({
      success: true,
      data: {
        overview: {
          totalDoubts,
          totalAppointments,
          feedbackGiven
        },
        doubtsByStatus,
        doubtsBySubject,
        upcomingAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};