import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useWebSocketEvent } from '../hooks/useWebsocket';
import apiClient from '../lib/api';

// Room Context
const RoomContext = createContext();

// Room actions
const ROOM_ACTIONS = {
  SET_ROOMS: 'SET_ROOMS',
  ADD_ROOM: 'ADD_ROOM',
  UPDATE_ROOM: 'UPDATE_ROOM',
  DELETE_ROOM: 'DELETE_ROOM',
  SET_ACTIVE_ROOM: 'SET_ACTIVE_ROOM',
  SET_ROOM_MEMBERS: 'SET_ROOM_MEMBERS',
  ADD_ROOM_MEMBER: 'ADD_ROOM_MEMBER',
  REMOVE_ROOM_MEMBER: 'REMOVE_ROOM_MEMBER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_JOINED_ROOMS: 'SET_JOINED_ROOMS',
};

// Initial state
const initialState = {
  rooms: [],
  activeRoom: null,
  roomMembers: {},
  joinedRooms: [],
  loading: false,
  error: null,
};

// Room reducer
const roomReducer = (state, action) => {
  switch (action.type) {
    case ROOM_ACTIONS.SET_ROOMS:
      return { ...state, rooms: action.payload };

    case ROOM_ACTIONS.ADD_ROOM:
      return { ...state, rooms: [action.payload, ...state.rooms] };

    case ROOM_ACTIONS.UPDATE_ROOM:
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.id
            ? { ...room, ...action.payload.updates }
            : room
        ),
        activeRoom:
          state.activeRoom?.id === action.payload.id
            ? { ...state.activeRoom, ...action.payload.updates }
            : state.activeRoom,
      };

    case ROOM_ACTIONS.DELETE_ROOM:
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload),
        activeRoom:
          state.activeRoom?.id === action.payload ? null : state.activeRoom,
        joinedRooms: state.joinedRooms.filter(id => id !== action.payload),
      };

    case ROOM_ACTIONS.SET_ACTIVE_ROOM:
      return { ...state, activeRoom: action.payload };

    case ROOM_ACTIONS.SET_ROOM_MEMBERS:
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          [action.payload.roomId]: action.payload.members,
        },
      };

    case ROOM_ACTIONS.ADD_ROOM_MEMBER:
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          [action.payload.roomId]: [
            ...(state.roomMembers[action.payload.roomId] || []),
            action.payload.member,
          ],
        },
      };

    case ROOM_ACTIONS.REMOVE_ROOM_MEMBER:
      return {
        ...state,
        roomMembers: {
          ...state.roomMembers,
          [action.payload.roomId]: (state.roomMembers[action.payload.roomId] || []).filter(
            member => member.id !== action.payload.memberId
          ),
        },
      };

    case ROOM_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ROOM_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ROOM_ACTIONS.SET_JOINED_ROOMS:
      return { ...state, joinedRooms: action.payload };

    default:
      return state;
  }
};

// Room Provider
export const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  // Fetch rooms from API on mount
  const fetchRooms = useCallback(async () => {
    dispatch({ type: ROOM_ACTIONS.SET_LOADING, payload: true });
    try {
      const { data } = await apiClient.get('/rooms');
      dispatch({ type: ROOM_ACTIONS.SET_ROOMS, payload: data });
    } catch (error) {
      dispatch({ type: ROOM_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ROOM_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // WebSocket events
  useWebSocketEvent('room:created', room => {
    dispatch({ type: ROOM_ACTIONS.ADD_ROOM, payload: room });
  });

  useWebSocketEvent('room:updated', ({ id, updates }) => {
    dispatch({ type: ROOM_ACTIONS.UPDATE_ROOM, payload: { id, updates } });
  });

  useWebSocketEvent('room:deleted', roomId => {
    dispatch({ type: ROOM_ACTIONS.DELETE_ROOM, payload: roomId });
  });

  useWebSocketEvent('room:member_joined', ({ roomId, member }) => {
    dispatch({ type: ROOM_ACTIONS.ADD_ROOM_MEMBER, payload: { roomId, member } });
  });

  useWebSocketEvent('room:member_left', ({ roomId, memberId }) => {
    dispatch({ type: ROOM_ACTIONS.REMOVE_ROOM_MEMBER, payload: { roomId, memberId } });
  });

  return (
    <RoomContext.Provider value={{ state, dispatch }}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook to use Room context
export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};
