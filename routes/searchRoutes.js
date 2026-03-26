const express = require('express');
const router = express.Router();

const {
  searchDoubts,
  searchMentors,
  searchAppointments
} = require('../controllers/searchcontroller');

const { protect } = require('../middleware/authMiddleware');

router.get('/doubts', protect, searchDoubts);
router.get('/mentors', searchMentors);
router.get('/appointments', protect, searchAppointments);

module.exports = router;
