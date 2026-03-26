const Doubt = require('../models/Doubt');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');

// @desc    Advanced search for doubts
// @route   GET /api/search/doubts
// @access  Private
exports.searchDoubts = async (req, res) => {
  try {
    const {
      keyword,
      subject,
      status,
      studentClass,
      mentorId,
      dateFrom,
      dateTo,
      sortBy,
      order,
      page,
      limit
    } = req.query;

    // Build query
    const query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    }

    // Keyword search (searches in remarks and subject)
    if (keyword) {
      query.$or = [
        { remarks: { $regex: keyword, $options: 'i' } },
        { subject: { $regex: keyword, $options: 'i' } },
        { studentName: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by subject
    if (subject) {
      query.subject = subject;
    }

    // Filter by status
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    // Filter by class
    if (studentClass) {
      query.studentClass = studentClass;
    }

    // Filter by mentor (for admin)
    if (mentorId && req.user.role === 'admin') {
      query.mentor = mentorId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Sorting
    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const doubts = await Doubt.find(query)
      .populate('student', 'name email class course')
      .populate('mentor', 'name email subject')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Doubt.countDocuments(query);

    // Get filter options for frontend
    const filterOptions = await getDoubtFilterOptions(req.user);

    res.json({
      success: true,
      data: doubts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      },
      filterOptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Advanced search for mentors
// @route   GET /api/search/mentors
// @access  Public
exports.searchMentors = async (req, res) => {
  try {
    const {
      keyword,
      subject,
      minRating,
      expertise,
      sortBy,
      order,
      page,
      limit
    } = req.query;

    // Build query
    const query = { role: 'mentor', isActive: true };

    // Keyword search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { subject: { $regex: keyword, $options: 'i' } },
        { expertise: { $regex: keyword, $options: 'i' } },
        { bio: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by subject
    if (subject) {
      query.subject = subject;
    }

    // Filter by expertise
    if (expertise) {
      query.expertise = { $regex: expertise, $options: 'i' };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get mentors
    let mentors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    // Get ratings for each mentor
    const mentorsWithRatings = await Promise.all(
      mentors.map(async (mentor) => {
        const ratingStats = await Feedback.aggregate([
          { $match: { mentor: mentor._id } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalFeedback: { $sum: 1 }
            }
          }
        ]);

        const resolvedCount = await Doubt.countDocuments({
          mentor: mentor._id,
          status: 'resolved'
        });

        return {
          ...mentor.toObject(),
          avgRating: ratingStats[0]?.avgRating || 0,
          totalFeedback: ratingStats[0]?.totalFeedback || 0,
          resolvedDoubts: resolvedCount
        };
      })
    );

    // Filter by minimum rating
    let filteredMentors = mentorsWithRatings;
    if (minRating) {
      filteredMentors = mentorsWithRatings.filter(m => m.avgRating >= parseFloat(minRating));
    }

    // Sorting
    if (sortBy === 'rating') {
      filteredMentors.sort((a, b) => {
        return order === 'asc' ? a.avgRating - b.avgRating : b.avgRating - a.avgRating;
      });
    } else if (sortBy === 'resolved') {
      filteredMentors.sort((a, b) => {
        return order === 'asc' ? a.resolvedDoubts - b.resolvedDoubts : b.resolvedDoubts - a.resolvedDoubts;
      });
    }

    // Get available subjects for filter
    const subjects = await User.distinct('subject', { role: 'mentor', isActive: true });

    res.json({
      success: true,
      data: filteredMentors,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      },
      filterOptions: {
        subjects: subjects.filter(Boolean)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Advanced search for appointments
// @route   GET /api/search/appointments
// @access  Private
exports.searchAppointments = async (req, res) => {
  try {
    const {
      keyword,
      status,
      subject,
      mentorId,
      studentId,
      dateFrom,
      dateTo,
      sortBy,
      order,
      page,
      limit
    } = req.query;

    // Build query
    const query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    }

    // Keyword search
    if (keyword) {
      query.$or = [
        { subject: { $regex: keyword, $options: 'i' } },
        { notes: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    // Filter by subject
    if (subject) {
      query.subject = subject;
    }

    // Filter by mentor/student (for admin)
    if (req.user.role === 'admin') {
      if (mentorId) query.mentor = mentorId;
      if (studentId) query.student = studentId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.appointmentDate = {};
      if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.appointmentDate.$lte = endDate;
      }
    }

    // Sorting
    const sortField = sortBy || 'appointmentDate';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const appointments = await Appointment.find(query)
      .populate('student', 'name email class course')
      .populate('mentor', 'name email subject')
      .populate('doubt', 'subject remarks')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get filter options
const getDoubtFilterOptions = async (user) => {
  try {
    const baseQuery = {};
    
    if (user.role === 'student') {
      baseQuery.student = user._id;
    } else if (user.role === 'mentor') {
      baseQuery.mentor = user._id;
    }

    const [subjects, statuses, classes] = await Promise.all([
      Doubt.distinct('subject', baseQuery),
      Doubt.distinct('status', baseQuery),
      Doubt.distinct('studentClass', baseQuery)
    ]);

    return {
      subjects: subjects.filter(Boolean),
      statuses: statuses.filter(Boolean),
      classes: classes.filter(Boolean)
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      subjects: [],
      statuses: ['pending', 'in-progress', 'resolved'],
      classes: []
    };
  }
};

module.exports = {
  searchDoubts: exports.searchDoubts,
  searchMentors: exports.searchMentors,
  searchAppointments: exports.searchAppointments
};