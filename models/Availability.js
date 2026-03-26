const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String, // Format: "09:00"
    required: true
  },
  endTime: {
    type: String, // Format: "17:00"
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
availabilitySchema.index({ mentor: 1, dayOfWeek: 1, isActive: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);