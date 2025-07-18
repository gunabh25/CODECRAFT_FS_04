/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';
import websocketManager from '../lib/websocket';

export const useWebSocket = (userId, token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState(null);
  const listenersRef = useRef(new Map());

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!userId || !token) return;

    try {
      setError(null);
      await websocketManager.connect(userId, token);
    } catch (err) {
      setError(err.message);
      console.error('WebSocket connection failed:', err);
    }
  }, [userId, token]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketManager.disconnect();
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((roomId, message, messageType = 'text') => {
    return websocketManager.sendMessage(roomId, message, messageType);
  }, []);

  // Join room
  const joinRoom = useCallback((roomId) => {
    return websocketManager.joinRoom(roomId);
  }, []);

  // Leave room
  const leaveRoom = useCallback((roomId) => {
    return websocketManager.leaveRoom(roomId);
  }, []);

  // Create room
  const createRoom = useCallback((roomName, isPrivate = false, participants = []) => {
    return websocketManager.createRoom(roomName, isPrivate, participants);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((roomId, isTyping) => {
    return websocketManager.sendTyping(roomId, isTyping);
  }, []);

  // Update user presence
  const updatePresence = useCallback((status) => {
    return websocketManager.updatePresence(status);
  }, []);

  // Subscribe to WebSocket events
  const subscribe = useCallback((event, callback) => {
    websocketManager.on(event, callback);
    
    // Store the listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      websocketManager.off(event, callback);
      
      const listeners = listenersRef.current.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }, []);

  // Unsubscribe from WebSocket events
  const unsubscribe = useCallback((event, callback) => {
    websocketManager.off(event, callback);
    
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }, []);

  // Setup WebSocket event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleError = (error) => {
      setError(error.message || 'WebSocket error occurred');
    };

    const handleMaxReconnectAttempts = () => {
      setError('Unable to connect to server. Please check your internet connection and try again.');
    };

    // Subscribe to connection events
    websocketManager.on('connected', handleConnected);
    websocketManager.on('disconnected', handleDisconnected);
    websocketManager.on('error', handleError);
    websocketManager.on('maxReconnectAttemptsReached', handleMaxReconnectAttempts);

    // Cleanup function
    return () => {
      websocketManager.off('connected', handleConnected);
      websocketManager.off('disconnected', handleDisconnected);
      websocketManager.off('error', handleError);
      websocketManager.off('maxReconnectAttemptsReached', handleMaxReconnectAttempts);
    };
  }, []);

  // Connect when userId and token are available
  useEffect(() => {
    if (userId && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, token, connect, disconnect]);

  // Update reconnect attempts
  useEffect(() => {
    const interval = setInterval(() => {
      const state = websocketManager.getConnectionState();
      setReconnectAttempts(state.reconnectAttempts);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      // Clean up all listeners
      for (const [event, listeners] of listenersRef.current) {
        listeners.forEach(callback => {
          websocketManager.off(event, callback);
        });
      }
      listenersRef.current.clear();
    };
  }, []);

  return {
    isConnected,
    reconnectAttempts,
    error,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    createRoom,
    sendTyping,
    updatePresence,
    subscribe,
    unsubscribe,
  };
};

// Hook for subscribing to specific WebSocket events
export const useWebSocketEvent = (event, callback, dependencies = []) => {
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const wrappedCallback = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    websocketManager.on(event, wrappedCallback);

    return () => {
      websocketManager.off(event, wrappedCallback);
    };
  }, [event, ...dependencies]);
};

// Hook for managing typing indicators
export const useTypingIndicator = (roomId, delay = 1000) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      websocketManager.sendTyping(roomId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      websocketManager.sendTyping(roomId, false);
    }, delay);
  }, [roomId, isTyping, delay]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTyping) {
      setIsTyping(false);
      websocketManager.sendTyping(roomId, false);
    }
  }, [roomId, isTyping]);

  // Listen for typing events from other users
  useWebSocketEvent('typing', (data) => {
    if (data.roomId === roomId) {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.id !== data.userId);
        if (data.isTyping) {
          return [...filtered, data.user];
        }
        return filtered;
      });
    }
  }, [roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
  };
};