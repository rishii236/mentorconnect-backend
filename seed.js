const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@mentorconnect.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin created');

    // Create Mentors
    const mentors = await User.insertMany([
      {
        name: 'Sabiha',
        email: 'sabiha@mentorconnect.com',
        password: 'password123',
        role: 'mentor',
        subject: 'Digital Electronics',
        expertise: 'Digital Circuits, Logic Gates, Boolean Algebra',
        bio: '10 years of experience in teaching Digital Electronics. Specializes in making complex concepts simple.'
      },
      {
        name: 'Deepak',
        email: 'deepak@mentorconnect.com',
        password: 'password123',
        role: 'mentor',
        subject: 'Artificial Intelligence',
        expertise: 'Machine Learning, Neural Networks, Deep Learning',
        bio: 'AI researcher with 8 years of experience. Published multiple papers on ML algorithms.'
      },
      {
        name: 'Vibhuti',
        email: 'vibhuti@mentorconnect.com',
        password: 'password123',
        role: 'mentor',
        subject: 'Object Oriented Programming',
        expertise: 'Java, Python, C++, OOP Design Patterns',
        bio: 'Software engineer turned educator. Expert in teaching programming fundamentals and OOP concepts.'
      },
      {
        name: 'Amrita',
        email: 'amrita@mentorconnect.com',
        password: 'password123',
        role: 'mentor',
        subject: 'Communication Skills',
        expertise: 'Business Communication, Presentation Skills, Public Speaking',
        bio: 'Corporate trainer with 12 years experience. Helped hundreds improve their communication.'
      },
      {
        name: 'Hrithik',
        email: 'hrithik@mentorconnect.com',
        password: 'password123',
        role: 'mentor',
        subject: 'Commercial Applications',
        expertise: 'Business Software, ERP Systems, SAP, Tally',
        bio: 'Industry expert in commercial software with real-world implementation experience.'
      }
    ]);

    console.log('✅ 5 Mentors created');

    // Create Test Student
    const student = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      class: 'BSCIT Sem 3',
      course: 'BSCIT'
    });

    console.log('✅ Test Student created');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📧 Login Credentials:\n');
    console.log('👨‍💼 Admin:');
    console.log('   Email: admin@mentorconnect.com');
    console.log('   Password: admin123\n');
    console.log('🎓 Student:');
    console.log('   Email: student@test.com');
    console.log('   Password: password123\n');
    console.log('👨‍🏫 Mentors (all use password: password123):');
    console.log('   - sabiha@mentorconnect.com (Digital Electronics)');
    console.log('   - deepak@mentorconnect.com (Artificial Intelligence)');
    console.log('   - vibhuti@mentorconnect.com (OOP)');
    console.log('   - amrita@mentorconnect.com (Communication Skills)');
    console.log('   - hrithik@mentorconnect.com (Commercial Applications)');
    console.log('\n' + '='.repeat(60) + '\n');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
