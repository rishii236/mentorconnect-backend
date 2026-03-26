require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('Testing Cloudinary Connection...\n');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET');

cloudinary.api.ping()
  .then(result => {
    console.log('\n✅ Cloudinary Connection Successful!');
    console.log('Status:', result.status);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Cloudinary Connection Failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check your credentials in .env file');
    process.exit(1);
  });