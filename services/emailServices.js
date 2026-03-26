const nodemailer = require('nodemailer');

// ================== TRANSPORTER ==================
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // remove in production
    }
  });
};

// ================== EMAIL TEMPLATES ==================
const emailTemplates = {
  appointmentBooked: (data) => ({
    subject: '📅 Appointment Booked - MentorConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">📅 Appointment Confirmed</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${data.studentName},</h2>
          <p style="color: #666; font-size: 16px;">Your appointment has been successfully booked!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Appointment Details</h3>
            <p style="margin: 10px 0;"><strong>Mentor:</strong> ${data.mentorName}</p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${data.time}</p>
            ${data.meetLink ? `<p style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="${data.meetLink}" style="color: #667eea;">${data.meetLink}</a></p>` : ''}
          </div>
          
          ${data.notes ? `<p style="color: #666;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
          
          <p style="color: #666;">Make sure to join on time. Good luck with your session!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px;">MentorConnect - Connecting Students with Mentors</p>
          </div>
        </div>
      </div>
    `
  }),

  appointmentReminder: (data) => ({
    subject: '⏰ Appointment Reminder - MentorConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⏰ Appointment Reminder</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${data.name},</h2>
          <p style="color: #666; font-size: 16px;">This is a friendly reminder about your upcoming appointment!</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">⏰ Your appointment is in 1 hour!</h3>
            <p style="margin: 10px 0;"><strong>With:</strong> ${data.mentorName}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${data.time}</p>
            ${data.meetLink ? `<p style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="${data.meetLink}" style="color: #92400e;">${data.meetLink}</a></p>` : ''}
          </div>
          
          <p style="color: #666;">Please make sure you're ready and have all necessary materials prepared.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px;">MentorConnect - Connecting Students with Mentors</p>
          </div>
        </div>
      </div>
    `
  }),

  doubtAssigned: (data) => ({
    subject: '📝 New Doubt Assigned - MentorConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">📝 New Doubt Assigned</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${data.mentorName},</h2>
          <p style="color: #666; font-size: 16px;">A new doubt has been assigned to you!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #10b981; margin-top: 0;">Doubt Details</h3>
            <p style="margin: 10px 0;"><strong>Student:</strong> ${data.studentName}</p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
            <p style="margin: 10px 0;"><strong>Class:</strong> ${data.studentClass}</p>
            <p style="margin: 10px 0;"><strong>Question:</strong> ${data.remarks}</p>
          </div>
          
          ${data.meetLink ? `
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">📞 Join Google Meet</h3>
              <p style="color: #e0f2fe; margin: 0 0 20px 0; font-size: 14px;">Click the button below to join the meeting with the student</p>
              <a href="${data.meetLink}" 
                 style="background: white; color: #2563eb; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                🎥 Join Meeting Now
              </a>
              <p style="color: #bfdbfe; margin: 15px 0 0 0; font-size: 12px;">Meeting Link: ${data.meetLink}</p>
            </div>
          ` : ''}
          
          <p style="color: #666; margin-top: 25px;">Please review and respond to the doubt at your earliest convenience.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/mentor-dashboard" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              📋 View in Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px;">MentorConnect - Connecting Students with Mentors</p>
          </div>
        </div>
      </div>
    `
  }),

  doubtResolved: (data) => ({
    subject: '✅ Your Doubt Has Been Resolved - MentorConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Doubt Resolved</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${data.studentName},</h2>
          <p style="color: #666; font-size: 16px;">Great news! Your doubt has been resolved by ${data.mentorName}.</p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">📚 Subject: ${data.subject}</h3>
            ${data.response ? `<p style="color: #374151;"><strong>Mentor's Response:</strong><br/>${data.response}</p>` : ''}
          </div>
          
          <p style="color: #666;">We'd love to hear your feedback about this session!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/feedback/${data.doubtId}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Give Feedback</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px;">MentorConnect - Connecting Students with Mentors</p>
          </div>
        </div>
      </div>
    `
  }),

  feedbackReceived: (data) => ({
    subject: '⭐ New Feedback Received - MentorConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⭐ New Feedback</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${data.mentorName},</h2>
          <p style="color: #666; font-size: 16px;">You've received new feedback from ${data.studentName}!</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Rating: ${'⭐'.repeat(data.rating)}</h3>
            ${data.comment ? `<p style="color: #374151;">"${data.comment}"</p>` : ''}
            ${data.tags && data.tags.length > 0 ? `<p style="color: #78716c;"><strong>Tags:</strong> ${data.tags.join(', ')}</p>` : ''}
          </div>
          
          <p style="color: #666;">Keep up the great work!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px;">MentorConnect - Connecting Students with Mentors</p>
          </div>
        </div>
      </div>
    `
  })
};

// ================== SEND EMAIL ==================
const sendEmail = async (to, template, data) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 Skipping email (not configured)');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    if (!transporter) return { success: false, message: 'Failed to create transporter' };

    const emailContent = emailTemplates[template](data);

    const info = await transporter.sendMail({
      from: `"MentorConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error('❌ Email error:', err.message);
    return { success: false, error: err.message };
  }
};

// ================== SERVICE FUNCTIONS ==================
const emailService = {

  sendAppointmentConfirmation: async (appointment, student, mentor) => {
    const date = new Date(appointment.appointmentDate);
    return await sendEmail(student.email, 'appointmentBooked', {
      studentName: student.name,
      mentorName: mentor.name,
      subject: appointment.subject,
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: `${appointment.startTime} - ${appointment.endTime}`,
      meetLink: appointment.meetLink,
      notes: appointment.notes
    });
  },

  sendAppointmentReminder: async (appointment, user, mentor) => {
    return await sendEmail(user.email, 'appointmentReminder', {
      name: user.name,
      mentorName: mentor.name,
      time: `${appointment.startTime} - ${appointment.endTime}`,
      meetLink: appointment.meetLink
    });
  },

  sendDoubtAssigned: async (doubt, mentor) => {
    return await sendEmail(mentor.email, 'doubtAssigned', {
      mentorName: mentor.name,
      studentName: doubt.studentName,
      subject: doubt.subject,
      studentClass: doubt.studentClass,
      remarks: doubt.remarks,
      meetLink: doubt.meetLink
    });
  },

  sendDoubtResolved: async (doubt, student, mentor) => {
    return await sendEmail(student.email, 'doubtResolved', {
      studentName: student.name,
      mentorName: mentor.name,
      subject: doubt.subject,
      response: doubt.mentorResponse,
      doubtId: doubt._id
    });
  },

  sendFeedbackNotification: async (feedback, mentor, student) => {
    return await sendEmail(mentor.email, 'feedbackReceived', {
      mentorName: mentor.name,
      studentName: student.name,
      rating: feedback.rating,
      comment: feedback.comment,
      tags: feedback.tags
    });
  }
};

module.exports = emailService;