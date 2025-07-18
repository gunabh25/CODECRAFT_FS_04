class WebSocketHandler {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.lastHeartbeat = Date.now();
  }

  connect(url, token) {
    try {
      this.ws = new WebSocket(`${url}?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        
        if (event.code !== 1000) { // Not a normal closure
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.emit('error', error);
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'message':
        this.emit('message', payload);
        break;
      case 'user_joined':
        this.emit('userJoined', payload);
        break;
      case 'user_left':
        this.emit('userLeft', payload);
        break;
      case 'typing_start':
        this.emit('typingStart', payload);
        break;
      case 'typing_stop':
        this.emit('typingStop', payload);
        break;
      case 'room_created':
        this.emit('roomCreated', payload);
        break;
      case 'room_deleted':
        this.emit('roomDeleted', payload);
        break;
      case 'user_status_change':
        this.emit('userStatusChange', payload);
        break;
      case 'notification':
        this.emit('notification', payload);
        break;
      case 'heartbeat':
        this.lastHeartbeat = Date.now();
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  send(type, payload) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket not connected');
    }
  }

  // Message methods
  sendMessage(roomId, message) {
    this.send('send_message', {
      roomId,
      message,
      timestamp: Date.now()
    });
  }

  joinRoom(roomId) {
    this.send('join_room', { roomId });
  }

  leaveRoom(roomId) {
    this.send('leave_room', { roomId });
  }

  startTyping(roomId) {
    this.send('typing_start', { roomId });
  }

  stopTyping(roomId) {
    this.send('typing_stop', { roomId });
  }

  createRoom(roomData) {
    this.send('create_room', roomData);
  }

  deleteRoom(roomId) {
    this.send('delete_room', { roomId });
  }

  updateUserStatus(status) {
    this.send('update_status', { status });
  }

  // Event listeners
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Heartbeat to maintain connection
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: Date.now() });
        
        // Check if we've received a heartbeat recently
        if (Date.now() - this.lastHeartbeat > 30000) {
          console.warn('No heartbeat received, connection may be stale');
          this.ws.close();
        }
      }
    }, 10000); // Send heartbeat every 10 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Reconnection logic
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.lastUrl, this.lastToken);
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Close connection
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
    }
    this.isConnected = false;
    this.listeners.clear();
  }
}

// Mock WebSocket for development/testing
class MockWebSocket {
  constructor() {
    this.listeners = new Map();
    this.mockUsers = [
      { id: 1, name: 'Alice', avatar: null, status: 'online' },
      { id: 2, name: 'Bob', avatar: null, status: 'away' },
      { id: 3, name: 'Charlie', avatar: null, status: 'online' }
    ];
    this.mockRooms = [
      { id: 1, name: 'General', memberCount: 12, isPrivate: false, unreadCount: 3 },
      { id: 2, name: 'Development', memberCount: 8, isPrivate: false, unreadCount: 0 },
      { id: 3, name: 'Random', memberCount: 15, isPrivate: false, unreadCount: 1 }
    ];
  }

  connect() {
    setTimeout(() => {
      this.emit('connected');
      this.simulateActivity();
    }, 100);
  }

  simulateActivity() {
    // Simulate incoming messages
    setInterval(() => {
      if (Math.random() > 0.8) {
        const randomUser = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
        const randomRoom = this.mockRooms[Math.floor(Math.random() * this.mockRooms.length)];
        
        this.emit('message', {
          id: Date.now(),
          text: this.getRandomMessage(),
          sender: randomUser,
          roomId: randomRoom.id,
          timestamp: Date.now(),
          type: 'text'
        });
      }
    }, 3000);

    // Simulate typing indicators
    setInterval(() => {
      if (Math.random() > 0.9) {
        const randomUser = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
        this.emit('typingStart', { user: randomUser, roomId: 1 });
        
        setTimeout(() => {
          this.emit('typingStop', { user: randomUser, roomId: 1 });
        }, 2000);
      }
    }, 5000);
  }

  getRandomMessage() {
    const messages = [
      'Hello everyone!',
      'How is everyone doing?',
      'Working on something exciting 🚀',
      'Anyone free for a quick call?',
      'Just deployed the new feature!',
      'Coffee break time ☕',
      'Great work on the project!',
      'See you all tomorrow',
      'Quick question about the API...',
      'Thanks for the help!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  send(type, payload) {
    // Simulate server response
    setTimeout(() => {
      switch (type) {
        case 'send_message':
          this.emit('message', {
            id: Date.now(),
            text: payload.message,
            sender: { id: 'current', name: 'You' },
            roomId: payload.roomId,
            timestamp: payload.timestamp,
            type: 'text'
          });
          break;
        case 'create_room':
          this.emit('roomCreated', {
            id: Date.now(),
            name: payload.name,
            memberCount: 1,
            isPrivate: payload.isPrivate,
            unreadCount: 0
          });
          break;
      }
    }, 100);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in mock WebSocket event callback:', error);
        }
      });
    }
  }

  disconnect() {
    this.listeners.clear();
  }

  getConnectionStatus() {
    return {
      connected: true,
      readyState: 1,
      reconnectAttempts: 0
    };
  }
}

// Export both real and mock versions
export { WebSocketHandler, MockWebSocket };

// Helper function to create appropriate WebSocket instance
export const createWebSocket = (useMock = false) => {
  return useMock ? new MockWebSocket() : new WebSocketHandler();
};