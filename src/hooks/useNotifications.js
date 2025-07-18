import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getNotifications(page, limit);
      
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setUnreadCount(response.unreadCount);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new notification
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await apiClient.deleteNotification(notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Create browser notification
  const createBrowserNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          return new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
          });
        }
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }, []);

  // Show notification based on type
  const showNotification = useCallback((notification) => {
    const { type, title, message, sender, roomName } = notification;
    
    let notificationTitle = title;
    let notificationBody = message;
    
    switch (type) {
      case 'message':
        notificationTitle = sender ? `${sender.name}` : 'New Message';
        notificationBody = roomName ? `in ${roomName}: ${message}` : message;
        break;
      case 'room_invite':
        notificationTitle = 'Room Invitation';
        notificationBody = `${sender?.name} invited you to join ${roomName}`;
        break;
      case 'mention':
        notificationTitle = 'You were mentioned';
        notificationBody = `${sender?.name} mentioned you in ${roomName}`;
        break;
      case 'friend_request':
        notificationTitle = 'Friend Request';
        notificationBody = `${sender?.name} sent you a friend request`;
        break;
      default:
        notificationTitle = title || 'Notification';
        notificationBody = message || 'You have a new notification';
    }

    createBrowserNotification(notificationTitle, {
      body: notificationBody,
      tag: notification.id,
      data: notification,
    });
  }, [createBrowserNotification]);

  // Initialize notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showNotification,
    createBrowserNotification,
    requestPermission,
    hasPermission: typeof window !== 'undefined' && Notification.permission === 'granted',
  };
};