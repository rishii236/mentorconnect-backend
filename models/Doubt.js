const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentClass: {
    type: String,
    required: true
  },
  studentCourse: {
    type: String,
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please specify the subject']
  },
  doubtImage: {
  type: String,
  required: false  // ✅ OPTIONAL!
  },
  remarks: {
    type: String,
    required: [true, 'Please describe your doubt']
  },
  meetLink: {
    type: String,
    required: [true, 'Please provide a Google Meet link']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  mentorResponse: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doubt', doubtSchema);
