/* eslint-disable react-hooks/exhaustive-deps */
// contexts/ChatContext.js - Chat state management
'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { WebSocketService } from '../utils/websocket';

const ChatContext = createContext();

// Chat reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, status: action.payload.status }
            : user
        )
      };
    
    case 'SET_ACTIVE_ROOM':
      return { ...state, activeRoom: action.payload };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: [
            ...(state.messages[action.payload.roomId] || []),
            action.payload.message
          ]
        }
      };
    
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: action.payload.messages
        }
      };
    
    case 'SET_TYPING':
      return {
        ...state,
        typing: {
          ...state.typing,
          [action.payload.roomId]: action.payload.users
        }
      };
    
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  rooms: [],
  users: [],
  activeRoom: null,
  messages: {},
  typing: {},
  onlineUsers: [],
  notifications: [],
  connectionStatus: 'disconnected'
};

// Chat provider component
export const ChatProvider = ({ children, user }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    if (user) {
      // Initialize WebSocket connection
      const ws = WebSocketService.getInstance();
      
      ws.connect(user);
      
      // Set up event listeners
      ws.on('connect', () => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      });
      
      ws.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
      });
      
      ws.on('message', (data) => {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { roomId: data.roomId, message: data }
        });
        
        // Add notification if message is not from current user
        if (data.senderId !== user.id && data.roomId !== state.activeRoom) {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now(),
              type: 'message',
              title: 'New message',
              content: `${data.senderName}: ${data.content}`,
              timestamp: new Date()
            }
          });
        }
      });
      
      ws.on('typing', (data) => {
        dispatch({
          type: 'SET_TYPING',
          payload: { roomId: data.roomId, users: data.users }
        });
      });
      
      ws.on('user-status', (data) => {
        dispatch({
          type: 'UPDATE_USER_STATUS',
          payload: { userId: data.userId, status: data.status }
        });
      });
      
      ws.on('online-users', (users) => {
        dispatch({ type: 'SET_ONLINE_USERS', payload: users });
      });
      
      ws.on('rooms', (rooms) => {
        dispatch({ type: 'SET_ROOMS', payload: rooms });
      });
      
      ws.on('users', (users) => {
        dispatch({ type: 'SET_USERS', payload: users });
      });
      
      // Load initial data
      loadInitialData();
    }
    
    return () => {
      WebSocketService.getInstance().disconnect();
    };
  }, [user]);

  const loadInitialData = () => {
    // Load rooms
    const mockRooms = [
      {
        id: 'general',
        name: 'General',
        type: 'public',
        members: [],
        lastMessage: null,
        unreadCount: 0
      },
      {
        id: 'random',
        name: 'Random',
        type: 'public',
        members: [],
        lastMessage: null,
        unreadCount: 0
      }
    ];
    
    dispatch({ type: 'SET_ROOMS', payload: mockRooms });
    
    // Load users
    const mockUsers = [
      {
        id: 'user1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        status: 'away',
        lastSeen: new Date(Date.now() - 300000).toISOString()
      }
    ];
    
    dispatch({ type: 'SET_USERS', payload: mockUsers });
  };

  const sendMessage = (roomId, content, type = 'text') => {
    const ws = WebSocketService.getInstance();
    ws.sendMessage(roomId, content, type);
  };

  const joinRoom = (roomId) => {
    const ws = WebSocketService.getInstance();
    ws.joinRoom(roomId);
    dispatch({ type: 'SET_ACTIVE_ROOM', payload: roomId });
  };

  const leaveRoom = (roomId) => {
    const ws = WebSocketService.getInstance();
    ws.leaveRoom(roomId);
  };

  const createRoom = (name, type = 'public') => {
    const ws = WebSocketService.getInstance();
    ws.createRoom(name, type);
  };

  const setTyping = (roomId, isTyping) => {
    const ws = WebSocketService.getInstance();
    ws.setTyping(roomId, isTyping);
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const value = {
    ...state,
    sendMessage,
    joinRoom,
    leaveRoom,
    createRoom,
    setTyping,
    removeNotification,
    dispatch
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};