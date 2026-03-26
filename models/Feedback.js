const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doubt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    enum: ['helpful', 'knowledgeable', 'patient', 'clear-explanation', 'responsive', 'friendly']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
feedbackSchema.index({ mentor: 1, rating: -1 });
feedbackSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);