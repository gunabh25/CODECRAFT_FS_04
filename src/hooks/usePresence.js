/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketEvent } from './useWebsocket';
import websocketManager from '../lib/websocket';

export const usePresence = (userId) => {
  const [userPresence, setUserPresence] = useState({});
  const [currentStatus, setCurrentStatus] = useState('online');
  const [isActive, setIsActive] = useState(true);
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Presence status options
  const PRESENCE_STATUS = {
    ONLINE: 'online',
    AWAY: 'away',
    BUSY: 'busy',
    OFFLINE: 'offline',
  };

  // Update user presence
  const updatePresence = useCallback((status) => {
    setCurrentStatus(status);
    websocketManager.updatePresence(status);
  }, []);

  // Handle presence update from WebSocket
  useWebSocketEvent('presenceUpdate', (data) => {
    setUserPresence(prev => ({
      ...prev,
      [data.userId]: {
        ...prev[data.userId],
        status: data.status,
        lastSeen: data.lastSeen,
        updatedAt: new Date().toISOString(),
      },
    }));
  });

  // Handle user joined event
  useWebSocketEvent('userJoined', (data) => {
    setUserPresence(prev => ({
      ...prev,
      [data.userId]: {
        ...prev[data.userId],
        status: PRESENCE_STATUS.ONLINE,
        lastSeen: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }));
  });

  // Handle user left event
  useWebSocketEvent('userLeft', (data) => {
    setUserPresence(prev => ({
      ...prev,
      [data.userId]: {
        ...prev[data.userId],
        status: PRESENCE_STATUS.OFFLINE,
        lastSeen: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }));
  });

  // Track user activity
  const trackActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (!isActive) {
      setIsActive(true);
      if (currentStatus === PRESENCE_STATUS.AWAY) {
        updatePresence(PRESENCE_STATUS.ONLINE);
      }
    }

    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Set new inactivity timeout (5 minutes)
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
      if (currentStatus === PRESENCE_STATUS.ONLINE) {
        updatePresence(PRESENCE_STATUS.AWAY);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }, [isActive, currentStatus, updatePresence]);

  // Get user presence status
  const getUserPresence = useCallback((targetUserId) => {
    return userPresence[targetUserId] || {
      status: PRESENCE_STATUS.OFFLINE,
      lastSeen: null,
      updatedAt: null,
    };
  }, [userPresence]);

  // Get presence color
  const getPresenceColor = useCallback((status) => {
    switch (status) {
      case PRESENCE_STATUS.ONLINE:
        return '#10b981'; // green
      case PRESENCE_STATUS.AWAY:
        return '#f59e0b'; // yellow
      case PRESENCE_STATUS.BUSY:
        return '#ef4444'; // red
      case PRESENCE_STATUS.OFFLINE:
      default:
        return '#6b7280'; // gray
    }
  }, []);

  // Get presence text
  const getPresenceText = useCallback((status) => {
    switch (status) {
      case PRESENCE_STATUS.ONLINE:
        return 'Online';
      case PRESENCE_STATUS.AWAY:
        return 'Away';
      case PRESENCE_STATUS.BUSY:
        return 'Busy';
      case PRESENCE_STATUS.OFFLINE:
      default:
        return 'Offline';
    }
  }, []);

  // Format last seen time
  const formatLastSeen = useCallback((lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return lastSeenDate.toLocaleDateString();
  }, []);

  // Check if user is online
  const isUserOnline = useCallback((targetUserId) => {
    const presence = getUserPresence(targetUserId);
    return presence.status === PRESENCE_STATUS.ONLINE;
  }, [getUserPresence]);

  // Get online users from a list
  const getOnlineUsers = useCallback((userIds) => {
    return userIds.filter(id => isUserOnline(id));
  }, [isUserOnline]);

  // Get users by status
  const getUsersByStatus = useCallback((status) => {
    return Object.entries(userPresence)
      .filter(([_, presence]) => presence.status === status)
      .map(([userId, _]) => userId);
  }, [userPresence]);

  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    // Initial activity track
    trackActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
      
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [trackActivity]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, user might be away
        if (currentStatus === PRESENCE_STATUS.ONLINE) {
          updatePresence(PRESENCE_STATUS.AWAY);
        }
      } else {
        // Page is visible, user is back
        if (currentStatus === PRESENCE_STATUS.AWAY) {
          updatePresence(PRESENCE_STATUS.ONLINE);
        }
        trackActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStatus, updatePresence, trackActivity]);

  // Handle beforeunload (user leaving)
  useEffect(() => {
    const handleBeforeUnload = () => {
      updatePresence(PRESENCE_STATUS.OFFLINE);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updatePresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  return {
    userPresence,
    currentStatus,
    isActive,
    PRESENCE_STATUS,
    updatePresence,
    getUserPresence,
    getPresenceColor,
    getPresenceText,
    formatLastSeen,
    isUserOnline,
    getOnlineUsers,
    getUsersByStatus,
    trackActivity,
  };
};