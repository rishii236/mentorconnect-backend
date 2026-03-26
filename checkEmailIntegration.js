// CHECK EMAIL INTEGRATION - Run: node checkEmailIntegration.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Email Integration in Controllers...\n');

const files = [
  {
    path: './controllers/doubtController.js',
    checks: [
      { text: "const emailService = require('../services/emailServices')", name: 'Import emailService' },
      { text: 'await emailService.sendDoubtAssigned', name: 'Call sendDoubtAssigned' },
      { text: "console.log('📧 Email sent to mentor:", name: 'Log email sent' }
    ]
  },
  {
    path: './controllers/availabilityController.js',
    checks: [
      { text: "const emailService = require('../services/emailServices')", name: 'Import emailService' },
      { text: 'await emailService.sendAppointmentConfirmation', name: 'Call sendAppointmentConfirmation' }
    ]
  },
  {
    path: './controllers/feedbackController.js',
    checks: [
      { text: "const emailService = require('../services/emailServices')", name: 'Import emailService' },
      { text: 'await emailService.sendFeedbackNotification', name: 'Call sendFeedbackNotification' }
    ]
  },
  {
    path: './services/emailServices.js',
    checks: [
      { text: 'sendDoubtAssigned', name: 'sendDoubtAssigned function' },
      { text: 'sendAppointmentConfirmation', name: 'sendAppointmentConfirmation function' },
      { text: 'sendFeedbackNotification', name: 'sendFeedbackNotification function' }
    ]
  }
];

let allGood = true;

files.forEach(file => {
  console.log(`📄 Checking: ${file.path}`);
  
  if (!fs.existsSync(file.path)) {
    console.log(`   ❌ FILE NOT FOUND!\n`);
    allGood = false;
    return;
  }

  const content = fs.readFileSync(file.path, 'utf8');
  
  file.checks.forEach(check => {
    if (content.includes(check.text)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ MISSING: ${check.name}`);
      allGood = false;
    }
  });
  
  console.log('');
});

console.log('═══════════════════════════════════════');
if (allGood) {
  console.log('✅ ALL EMAIL INTEGRATION CHECKS PASSED!');
  console.log('');
  console.log('Email should work when:');
  console.log('- Student submits doubt → Mentor gets email');
  console.log('- Student books appointment → Both get email');
  console.log('- Student gives feedback → Mentor gets email');
  console.log('');
  console.log('Next step: Test by submitting a doubt!');
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('');
  console.log('You need to replace these controller files:');
  console.log('1. doubtController.js (from outputs folder)');
  console.log('2. availabilityController.js (from outputs folder)');
  console.log('3. feedbackController.js (from outputs folder)');
  console.log('');
  console.log('These files should have email integration code.');
  console.log('Check your /mnt/user-data/outputs/ folder for:');
  console.log('- doubtController-WithEmail.js');
  console.log('- availabilityController-WithEmail.js');
  console.log('- feedbackController-WithEmail.js');
}
console.log('═══════════════════════════════════════');