const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // Format: "09:00"
    required: true
  },
  endTime: {
    type: String, // Format: "10:00"
    required: true
  },
  meetLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
appointmentSchema.index({ mentor: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ student: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);