const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:doubtId', protect, sendMessage);
router.get('/:doubtId', protect, getMessages);
router.put('/:doubtId/read', protect, markAsRead);
router.get('/unread/count', protect, getUnreadCount);

module.exports = router;