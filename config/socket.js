const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173", // Your frontend URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      const { receiverId, message, senderId, senderName } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          message,
          senderId,
          senderName,
          timestamp: new Date()
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId, isTyping, senderName } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          isTyping,
          senderName
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });

  return io;
};

// Emit notification to specific user
const emitNotification = (userId, notification) => {
  if (io) {
    const connectedUsers = Array.from(io.sockets.sockets.values());
    const userSocket = connectedUsers.find(s => s.userId === userId);
    
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }
};

module.exports = { initSocket, emitNotification };