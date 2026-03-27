const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const feedbackRoutes = require('./routes/feedbackRoutes');
const searchRoutes = require('./routes/searchRoutes');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Make io accessible to routes
app.set('io', io);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS first - before everything else
app.use(cors({
  origin: [
    'https://mentorconnect-blond.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// THEN body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'doubts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // ✅ ADDED: Admin routes
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/search', searchRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'MentorConnect API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Socket.io initialized ✅');
});