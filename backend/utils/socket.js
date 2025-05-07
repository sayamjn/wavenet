const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

exports.setupSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    socket.join(socket.user._id.toString());
    
    socket.on('join-note', (noteId) => {
      socket.join(`note:${noteId}`);
      console.log(`${socket.user.name} joined note: ${noteId}`);
    });

    socket.on('leave-note', (noteId) => {
      socket.leave(`note:${noteId}`);
      console.log(`${socket.user.name} left note: ${noteId}`);
    });

    socket.on('note-content-update', ({ noteId, content, cursorPosition }) => {
      socket.to(`note:${noteId}`).emit('note-content-updated', {
        noteId,
        content,
        cursorPosition,
        updatedBy: {
          _id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  console.log('Socket.io initialized');
  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};