const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getMentorAnalytics,
  getStudentAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/mentor', protect, authorize('mentor'), getMentorAnalytics);
router.get('/student', protect, authorize('student'), getStudentAnalytics);

module.exports = router;