/**
 * Analytics utility for tracking user interactions and chat metrics
 */

class Analytics {
  constructor() {
    this.isInitialized = false;
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initialize(userId = null) {
    this.userId = userId;
    this.isInitialized = true;
    
    // Track session start
    this.track('Session Started', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('Page Hidden');
      } else {
        this.track('Page Visible');
      }
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.track('Session Ended', {
        sessionDuration: Date.now() - this.sessionStartTime
      });
    });

    this.sessionStartTime = Date.now();
  }

  track(eventName, properties = {}) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const event = {
      id: this.generateEventId(),
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href
      }
    };

    this.events.push(event);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // Send to analytics service (replace with your actual service)
    this.sendToAnalyticsService(event);
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sendToAnalyticsService(event) {
    // Replace with your actual analytics service
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    // For now, store in localStorage for demo purposes
    try {
      const stored = JSON.parse(localStorage.getItem('chat_analytics') || '[]');
      stored.push(event);
      localStorage.setItem('chat_analytics', JSON.stringify(stored.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  // Chat-specific tracking methods
  trackMessageSent(messageData) {
    this.track('Message Sent', {
      messageType: messageData.type || 'text',
      messageLength: messageData.content?.length || 0,
      roomId: messageData.roomId,
      isPrivate: messageData.isPrivate || false,
      hasAttachment: messageData.hasAttachment || false
    });
  }

  trackMessageReceived(messageData) {
    this.track('Message Received', {
      messageType: messageData.type || 'text',
      senderId: messageData.senderId,
      roomId: messageData.roomId,
      isPrivate: messageData.isPrivate || false
    });
  }

  trackRoomJoined(roomData) {
    this.track('Room Joined', {
      roomId: roomData.id,
      roomName: roomData.name,
      roomType: roomData.type,
      memberCount: roomData.memberCount
    });
  }

  trackRoomLeft(roomData) {
    this.track('Room Left', {
      roomId: roomData.id,
      roomName: roomData.name,
      timeSpent: roomData.timeSpent
    });
  }

  trackUserOnline() {
    this.track('User Online');
  }

  trackUserOffline() {
    this.track('User Offline');
  }

  trackFileUpload(fileData) {
    this.track('File Uploaded', {
      fileType: fileData.type,
      fileSize: fileData.size,
      fileName: fileData.name?.substring(0, 50) // Truncate for privacy
    });
  }

  trackNotificationShown(notificationData) {
    this.track('Notification Shown', {
      notificationType: notificationData.type,
      notificationTitle: notificationData.title
    });
  }

  trackErrorOccurred(errorData) {
    this.track('Error Occurred', {
      errorMessage: errorData.message,
      errorType: errorData.type,
      errorStack: errorData.stack?.substring(0, 500) // Truncate stack trace
    });
  }

  trackFeatureUsed(featureName, properties = {}) {
    this.track('Feature Used', {
      featureName,
      ...properties
    });
  }

  // Performance tracking
  trackPerformance(metricName, value, unit = 'ms') {
    this.track('Performance Metric', {
      metricName,
      value,
      unit
    });
  }

  // User engagement tracking
  trackEngagement(action, properties = {}) {
    this.track('User Engagement', {
      action,
      ...properties
    });
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const summary = {
      totalEvents: this.events.length,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      eventTypes: {}
    };

    this.events.forEach(event => {
      summary.eventTypes[event.name] = (summary.eventTypes[event.name] || 0) + 1;
    });

    return summary;
  }

  // Export data (for debugging or data export)
  exportData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      summary: this.getAnalyticsSummary()
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

// Make it available globally
if (typeof window !== 'undefined') {
  window.analytics = analytics;
}

export default analytics;