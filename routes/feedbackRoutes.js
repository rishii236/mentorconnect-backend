const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getMentorFeedback,
  getMyFeedback,
  getFeedbackReceived,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/mentor/:mentorId', getMentorFeedback);

// Protected routes
router.post('/', protect, authorize('student'), submitFeedback);
router.get('/my-feedback', protect, authorize('student'), getMyFeedback);
router.get('/received', protect, authorize('mentor'), getFeedbackReceived);
router.put('/:id', protect, authorize('student'), updateFeedback);
router.delete('/:id', protect, authorize('student'), deleteFeedback);

module.exports = router;