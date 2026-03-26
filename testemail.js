// TEST EMAIL - Place in backend folder and run: node testEmail.js

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check .env variables
  console.log('📋 Configuration:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '****' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ ERROR: EMAIL_USER or EMAIL_PASSWORD not set in .env file!');
    console.log('');
    console.log('Required in .env:');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-16-digit-app-password');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    // Verify connection
    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"MentorConnect Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🧪 Test Email from MentorConnect',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">✅ Email Configuration Working!</h2>
          <p>If you're reading this, your MentorConnect email service is properly configured.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Configuration Details:</strong></p>
            <p>Host: ${process.env.EMAIL_HOST}</p>
            <p>Port: ${process.env.EMAIL_PORT}</p>
            <p>From: ${process.env.EMAIL_USER}</p>
          </div>
          <p style="color: #666;">You can now submit doubts and receive email notifications!</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('');
    console.log('🎉 SUCCESS! Check your inbox:', process.env.EMAIL_USER);
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify you received the test email');
    console.log('2. Check spam folder if not in inbox');
    console.log('3. If received, your email service is working!');
    console.log('4. Now try submitting a doubt from the app');

  } catch (error) {
    console.log('❌ EMAIL TEST FAILED!\n');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.message.includes('Invalid login')) {
      console.log('🔧 FIX: Invalid credentials');
      console.log('   - Make sure EMAIL_PASSWORD is your Gmail App Password');
      console.log('   - NOT your regular Gmail password');
      console.log('   - Generate one at: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout')) {
      console.log('🔧 FIX: Connection issue');
      console.log('   - Check your internet connection');
      console.log('   - Make sure EMAIL_HOST=smtp.gmail.com');
      console.log('   - Make sure EMAIL_PORT=587');
    } else {
      console.log('🔧 Check your .env file configuration');
    }
  }
}

testEmail();