const express = require('express');
const router = express.Router();
const {
  submitDoubt,
  getMyDoubts,
  getMentorDoubts,
  getDoubtById,
  updateDoubtStatus,
  deleteDoubt
} = require('../controllers/doubtController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student routes
router.post('/', protect, authorize('student'), upload.single('doubtImage'), submitDoubt);
router.get('/my-doubts', protect, authorize('student'), getMyDoubts);

// Mentor routes
router.get('/mentor-doubts', protect, authorize('mentor'), getMentorDoubts);
router.put('/:id/status', protect, authorize('mentor'), updateDoubtStatus);

// Common routes
router.get('/:id', protect, getDoubtById);
router.delete('/:id', protect, deleteDoubt);

module.exports = router;
