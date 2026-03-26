const Message = require('../models/Message');
const Doubt = require('../models/Doubt');

// @desc    Send a message
// @route   POST /api/chat/:doubtId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { doubtId } = req.params;

    const doubt = await Doubt.findById(doubtId)
      .populate('student')
      .populate('mentor');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Determine receiver
    const isStudent = req.user._id.toString() === doubt.student._id.toString();
    const receiver = isStudent ? doubt.mentor._id : doubt.student._id;

    const newMessage = await Message.create({
      doubt: doubtId,
      sender: req.user._id,
      receiver: receiver,
      message
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a doubt
// @route   GET /api/chat/:doubtId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { doubtId } = req.params;

    const messages = await Message.find({ doubt: doubtId })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort('createdAt');

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:doubtId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { doubtId } = req.params;

    await Message.updateMany(
      { doubt: doubtId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};