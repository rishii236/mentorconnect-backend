const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const emailService = require('../services/emailServices'); // ✅ EMAIL SERVICE

// @desc    Set mentor availability
// @route   POST /api/availability
// @access  Private (Mentor)
exports.setAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;

    // Check if availability already exists
    const existing = await Availability.findOne({
      mentor: req.user._id,
      dayOfWeek,
      isActive: true
    });

    if (existing) {
      // Update existing
      existing.startTime = startTime;
      existing.endTime = endTime;
      await existing.save();
      return res.json({ success: true, data: existing });
    }

    // Create new
    const availability = await Availability.create({
      mentor: req.user._id,
      dayOfWeek,
      startTime,
      endTime
    });

    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentor availability
// @route   GET /api/availability/mentor/:mentorId
// @access  Public
exports.getMentorAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      mentor: req.params.mentorId,
      isActive: true
    }).sort('dayOfWeek');

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my availability (mentor)
// @route   GET /api/availability/my-availability
// @access  Private (Mentor)
exports.getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      mentor: req.user._id,
      isActive: true
    }).sort('dayOfWeek');

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete availability slot
// @route   DELETE /api/availability/:id
// @access  Private (Mentor)
exports.deleteAvailability = async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    if (availability.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    availability.isActive = false;
    await availability.save();

    res.json({
      success: true,
      message: 'Availability removed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book an appointment
// @route   POST /api/availability/book
// @access  Private (Student)
exports.bookAppointment = async (req, res) => {
  try {
    const { mentorId, doubtId, subject, appointmentDate, startTime, endTime, meetLink, notes } = req.body;

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      mentor: mentorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      status: { $in: ['scheduled', 'rescheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      student: req.user._id,
      mentor: mentorId,
      doubt: doubtId,
      subject,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      meetLink,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('student', 'name email')
      .populate('mentor', 'name email subject');

    // ✅ SEND CONFIRMATION EMAIL TO STUDENT
    await emailService.sendAppointmentConfirmation(
      populatedAppointment,
      populatedAppointment.student,
      populatedAppointment.mentor
    );
    console.log('📧 Appointment confirmation email sent to:', populatedAppointment.student.email);

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my appointments
// @route   GET /api/availability/my-appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'student'
      ? { student: req.user._id }
      : { mentor: req.user._id };

    const appointments = await Appointment.find(query)
      .populate('student', 'name email class course')
      .populate('mentor', 'name email subject')
      .populate('doubt', 'subject remarks')
      .sort('-appointmentDate');

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/availability/appointment/:id
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    const isAuthorized = 
      appointment.student.toString() === req.user._id.toString() ||
      appointment.mentor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};