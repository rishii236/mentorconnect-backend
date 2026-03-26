const express = require('express');
const router = express.Router();
const {
  getAllMentors,
  getMentorById,
  getMentorsBySubject,
  addMentor,
  updateMentor,
  deleteMentor
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllMentors);
router.get('/:id', getMentorById);
router.get('/subject/:subject', getMentorsBySubject);

// Admin routes
router.post('/', protect, authorize('admin'), addMentor);
router.put('/:id', protect, authorize('admin'), updateMentor);
router.delete('/:id', protect, authorize('admin'), deleteMentor);

module.exports = router;
