import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../services/authService';

/**
 * Custom hook for socket.io integration
 * @returns {Object} Socket instance and helper methods
 */
const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      return;
    }
    
    // Connect to socket server with auth token
    const socketUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:4000';
    
    socketRef.current = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Handle connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  /**
   * Join a note room for collaboration
   * @param {String} noteId - Note ID to join
   */
  const joinNote = useCallback((noteId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-note', noteId);
    }
  }, [isConnected]);

  /**
   * Leave a note room
   * @param {String} noteId - Note ID to leave
   */
  const leaveNote = useCallback((noteId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-note', noteId);
    }
  }, [isConnected]);

  /**
   * Send note content update
   * @param {String} noteId - Note ID
   * @param {String} content - Updated content
   * @param {Object} cursorPosition - Current cursor position
   */
  const updateNoteContent = useCallback((noteId, content, cursorPosition = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('note-content-update', {
        noteId,
        content,
        cursorPosition
      });
    }
  }, [isConnected]);

  /**
   * Subscribe to socket events
   * @param {String} event - Event name
   * @param {Function} callback - Event callback
   */
  const subscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, (data) => {
        setLastMessage({ event, data });
        callback(data);
      });
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    lastMessage,
    joinNote,
    leaveNote,
    updateNoteContent,
    subscribe
  };
};

export default useSocket;