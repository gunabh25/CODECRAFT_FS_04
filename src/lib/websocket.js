class WebSocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.connectionPromise = null;
  }

  connect(userId, token) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?userId=${userId}&token=${token}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.connectionPromise = null;
          this.emit('disconnected');
          
          if (event.code !== 1000) { // Not a normal closure
            this.attemptReconnect(userId, token);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  attemptReconnect(userId, token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectionPromise = null;
      this.connect(userId, token);
    }, delay);
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'message':
        this.emit('message', payload);
        break;
      case 'typing':
        this.emit('typing', payload);
        break;
      case 'user_joined':
        this.emit('userJoined', payload);
        break;
      case 'user_left':
        this.emit('userLeft', payload);
        break;
      case 'presence_update':
        this.emit('presenceUpdate', payload);
        break;
      case 'room_created':
        this.emit('roomCreated', payload);
        break;
      case 'file_uploaded':
        this.emit('fileUploaded', payload);
        break;
      case 'notification':
        this.emit('notification', payload);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  send(type, payload) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket is not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  // Message operations
  sendMessage(roomId, message, messageType = 'text') {
    return this.send('send_message', {
      roomId,
      message,
      messageType,
      timestamp: new Date().toISOString()
    });
  }

  joinRoom(roomId) {
    return this.send('join_room', { roomId });
  }

  leaveRoom(roomId) {
    return this.send('leave_room', { roomId });
  }

  createRoom(roomName, isPrivate = false, participants = []) {
    return this.send('create_room', {
      roomName,
      isPrivate,
      participants
    });
  }

  sendTyping(roomId, isTyping) {
    return this.send('typing', { roomId, isTyping });
  }

  updatePresence(status) {
    return this.send('presence_update', { status });
  }

  // Event listener management
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
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }
    this.isConnected = false;
    this.connectionPromise = null;
    this.listeners.clear();
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED
    };
  }
}

// Singleton instance
const websocketManager = new WebSocketManager();
export default websocketManager;