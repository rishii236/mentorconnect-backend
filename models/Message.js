const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  doubt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
messageSchema.index({ doubt: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);