const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getMe,
  updateProfile,           // ← ADD THIS
  changePassword,          // ← ADD THIS
  deleteAccount,           // ← ADD THIS
  updateNotificationPreferences  // ← ADD THIS
} = require('../controllers/authController');

// Existing routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// NEW: Settings routes
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);
router.put('/notification-preferences', protect, updateNotificationPreferences);

module.exports = router;