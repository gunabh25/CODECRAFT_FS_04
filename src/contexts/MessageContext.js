import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useWebSocketEvent } from '../hooks/useWebsocket';
import apiClient from '../lib/api';

// Message Context
const MessageContext = createContext();

// Message actions
const MESSAGE_ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  MARK_AS_READ: 'MARK_AS_READ',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  CLEAR_ROOM_MESSAGES: 'CLEAR_ROOM_MESSAGES',
};

// Initial state
const initialState = {
  messages: {},
  loading: {},
  errors: {},
  typingUsers: {},
  unreadCounts: {},
};

// Message reducer
const messageReducer = (state, action) => {
  switch (action.type) {
    case MESSAGE_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: action.payload.messages,
        },
      };

    case MESSAGE_ACTIONS.ADD_MESSAGE:
      const { roomId, message } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [roomId]: [...(state.messages[roomId] || []), message],
        },
      };

    case MESSAGE_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: state.messages[action.payload.roomId]?.map(msg =>
            msg.id === action.payload.messageId
              ? { ...msg, ...action.payload.updates }
              : msg
          ) || [],
        },
      };

    case MESSAGE_ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: state.messages[action.payload.roomId]?.filter(
            msg => msg.id !== action.payload.messageId
          ) || [],
        },
      };

    case MESSAGE_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: state.messages[action.payload.roomId]?.map(msg =>
            action.payload.messageIds.includes(msg.id)
              ? { ...msg, read: true }
              : msg
          ) || [],
        },
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.roomId]: 0,
        },
      };

    case MESSAGE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.roomId]: action.payload.loading,
        },
      };

    case MESSAGE_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.roomId]: action.payload.error,
        },
      };

    case MESSAGE_ACTIONS.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.roomId]: action.payload.users,
        },
      };

    case MESSAGE_ACTIONS.CLEAR_ROOM_MESSAGES:
      const newMessages = { ...state.messages };
      const newLoading = { ...state.loading };
      const newErrors = { ...state.errors };
      const newTypingUsers = { ...state.typingUsers };
      const newUnreadCounts = { ...state.unreadCounts };

      delete newMessages[action.payload.roomId];
      delete newLoading[action.payload.roomId];
      delete newErrors[action.payload.roomId];
      delete newTypingUsers[action.payload.roomId];
      delete newUnreadCounts[action.payload.roomId];

      return {
        ...state,
        messages: newMessages,
        loading: newLoading,
        errors: newErrors,
        typingUsers: newTypingUsers,
        unreadCounts: newUnreadCounts,
      };

    default:
      return state;
  }
};

// Message Provider
export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  // Load messages for a room
  const loadMessages = useCallback(async (roomId, page = 1, limit = 50) => {
    dispatch({
      type: MESSAGE_ACTIONS.SET_LOADING,
      payload: { roomId, loading: true },
    });

    try {
      const response = await apiClient.getMessages(roomId, page, limit);
      
      dispatch({
        type: MESSAGE_ACTIONS.SET_MESSAGES,
        payload: {
          roomId,
          messages: response.messages,
        },
      });

      // Update unread count
      dispatch({
        type: MESSAGE_ACTIONS.SET_ERROR,
        payload: { roomId, error: null },
      });

    } catch (error) {
      dispatch({
        type: MESSAGE_ACTIONS.SET_ERROR,
        payload: { roomId, error: error.message },
      });
    } finally {
      dispatch({
        type: MESSAGE_ACTIONS.SET_LOADING,
        payload: { roomId, loading: false },
      });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (roomId, content, messageType = 'text') => {
    try {
      const response = await apiClient.sendMessage(roomId, content, messageType);
      
      // Message will be added via WebSocket event
      return response;
    } catch (error) {
      dispatch({
        type: MESSAGE_ACTIONS.SET_ERROR,
        payload: { roomId, error: error.message },
      });
      throw error;
    }
  }, []);

  // Edit message
  const editMessage = useCallback(async (roomId, messageId, content) => {
    try {
      const response = await apiClient.editMessage(messageId, content);
      
      dispatch({
        type: MESSAGE_ACTIONS.UPDATE_MESSAGE,
        payload: {
          roomId,
          messageId,
          updates: { content, edited: true, editedAt: new Date().toISOString() },
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: MESSAGE_ACTIONS.SET_ERROR,
        payload: { roomId, error: error.message },
      });
      throw error;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (roomId, messageId) => {
    try {
      await apiClient.deleteMessage(messageId);
      
      dispatch({
        type: MESSAGE_ACTIONS.DELETE_MESSAGE,
        payload: { roomId, messageId },
      });
    } catch (error) {
      dispatch({
        type: MESSAGE_ACTIONS.SET_ERROR,
        payload: { roomId, error: error.message },
      });
      throw error;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (roomId, messageIds) => {
    try {
      await apiClient.markMessagesAsRead(roomId, messageIds);
      
      dispatch({
        type: MESSAGE_ACTIONS.MARK_AS_READ,
        payload: { roomId, messageIds },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  // Clear room messages
  const clearRoomMessages = useCallback((roomId) => {
    dispatch({
      type: MESSAGE_ACTIONS.CLEAR_ROOM_MESSAGES,
      payload: { roomId },
    });
  }, []);

  // Get messages for a room
  const getRoomMessages = useCallback((roomId) => {
    return state.messages[roomId] || [];
  }, [state.messages]);

  // Get unread count for a room
  const getUnreadCount = useCallback((roomId) => {
    return state.unreadCounts[roomId] || 0;
  }, [state.unreadCounts]);

  // Get typing users for a room
  const getTypingUsers = useCallback((roomId) => {
    return state.typingUsers[roomId] || [];
  }, [state.typingUsers]);

  // Get loading state for a room
  const isLoading = useCallback((roomId) => {
    return state.loading[roomId] || false;
  }, [state.loading]);

  // Get error for a room
  const getError = useCallback((roomId) => {
    return state.errors[roomId] || null;
  }, [state.errors]);

  // WebSocket event handlers
  useWebSocketEvent('message', (data) => {
    dispatch({
      type: MESSAGE_ACTIONS.ADD_MESSAGE,
      payload: {
        roomId: data.roomId,
        message: data.message,
      },
    });
  });

  useWebSocketEvent('typing', (data) => {
    dispatch({
      type: MESSAGE_ACTIONS.SET_TYPING_USERS,
      payload: {
        roomId: data.roomId,
        users: data.users,
      },
    });
  });

  useWebSocketEvent('messageUpdated', (data) => {
    dispatch({
      type: MESSAGE_ACTIONS.UPDATE_MESSAGE,
      payload: {
        roomId: data.roomId,
        messageId: data.messageId,
        updates: data.updates,
      },
    });
  });

  useWebSocketEvent('messageDeleted', (data) => {
    dispatch({
      type: MESSAGE_ACTIONS.DELETE_MESSAGE,
      payload: {
        roomId: data.roomId,
        messageId: data.messageId,
      },
    });
  });

  const value = {
    // State
    messages: state.messages,
    loading: state.loading,
    errors: state.errors,
    typingUsers: state.typingUsers,
    unreadCounts: state.unreadCounts,

    // Actions
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    clearRoomMessages,

    // Getters
    getRoomMessages,
    getUnreadCount,
    getTypingUsers,
    isLoading,
    getError,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

// Hook to use message context
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};