/**
 * Analytics utility for tracking user interactions and chat metrics
 */

class Analytics {
  constructor() {
    this.isInitialized = false;
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.sessionStartTime = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initialize(userId = null) {
    this.userId = userId;
    this.isInitialized = true;
    this.sessionStartTime = Date.now();

    this.track('Session Started', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    document.addEventListener('visibilitychange', () => {
      this.track(document.hidden ? 'Page Hidden' : 'Page Visible');
    });

    window.addEventListener('beforeunload', () => {
      this.track('Session Ended', {
        sessionDuration: Date.now() - this.sessionStartTime
      });
    });
  }

  track(eventName, properties = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️ Analytics not initialized');
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

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    this.sendToAnalyticsService(event);
  }

  sendToAnalyticsService(event) {
    try {
      const stored = JSON.parse(localStorage.getItem('chat_analytics') || '[]');
      stored.push(event);
      localStorage.setItem('chat_analytics', JSON.stringify(stored.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('❌ Failed to store analytics event:', error);
    }
  }

  // ----- Chat-specific tracking -----
  trackMessageSent(data) {
    this.track('Message Sent', {
      messageType: data.type || 'text',
      messageLength: data.content?.length || 0,
      roomId: data.roomId,
      isPrivate: data.isPrivate || false,
      hasAttachment: data.hasAttachment || false
    });
  }

  trackMessageReceived(data) {
    this.track('Message Received', {
      messageType: data.type || 'text',
      senderId: data.senderId,
      roomId: data.roomId,
      isPrivate: data.isPrivate || false
    });
  }

  trackRoomJoined(data) {
    this.track('Room Joined', {
      roomId: data.id,
      roomName: data.name,
      roomType: data.type,
      memberCount: data.memberCount
    });
  }

  trackRoomLeft(data) {
    this.track('Room Left', {
      roomId: data.id,
      roomName: data.name,
      timeSpent: data.timeSpent
    });
  }

  trackUserOnline() {
    this.track('User Online');
  }

  trackUserOffline() {
    this.track('User Offline');
  }

  trackFileUpload(file) {
    this.track('File Uploaded', {
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name?.substring(0, 50)
    });
  }

  trackNotificationShown(notification) {
    this.track('Notification Shown', {
      notificationType: notification.type,
      notificationTitle: notification.title
    });
  }

  trackErrorOccurred(error) {
    this.track('Error Occurred', {
      errorMessage: error.message,
      errorType: error.type,
      errorStack: error.stack?.substring(0, 500)
    });
  }

  trackFeatureUsed(name, properties = {}) {
    this.track('Feature Used', {
      featureName: name,
      ...properties
    });
  }

  trackPerformance(metric, value, unit = 'ms') {
    this.track('Performance Metric', {
      metricName: metric,
      value,
      unit
    });
  }

  trackEngagement(action, properties = {}) {
    this.track('User Engagement', {
      action,
      ...properties
    });
  }

  getAnalyticsSummary() {
    const summary = {
      totalEvents: this.events.length,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      eventTypes: {}
    };

    this.events.forEach(e => {
      summary.eventTypes[e.name] = (summary.eventTypes[e.name] || 0) + 1;
    });

    return summary;
  }

  exportData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      summary: this.getAnalyticsSummary()
    };
  }
}

// Singleton
const analytics = new Analytics();
if (typeof window !== 'undefined') {
  window.analytics = analytics;
}
export default analytics;
