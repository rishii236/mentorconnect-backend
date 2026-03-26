const express = require('express');
const router = express.Router();
const {
  setAvailability,
  getMentorAvailability,
  getMyAvailability,
  deleteAvailability,
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Availability routes
router.post('/', protect, authorize('mentor'), setAvailability);
router.get('/my-availability', protect, authorize('mentor'), getMyAvailability);
router.get('/mentor/:mentorId', getMentorAvailability);
router.delete('/:id', protect, authorize('mentor'), deleteAvailability);

// Appointment routes
router.post('/book', protect, authorize('student'), bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/appointment/:id', protect, updateAppointmentStatus);

module.exports = router;