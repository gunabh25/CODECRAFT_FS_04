class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.token = null;
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // User endpoints
  async getProfile() {
    return await this.request('/user/profile');
  }

  async updateProfile(userData) {
    return await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updatePassword(currentPassword, newPassword) {
    return await this.request('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async searchUsers(query) {
    return await this.request(`/user/search?q=${encodeURIComponent(query)}`);
  }

  async getUserPresence(userId) {
    return await this.request(`/user/${userId}/presence`);
  }

  // Room endpoints
  async getRooms() {
    return await this.request('/rooms');
  }

  async getRoom(roomId) {
    return await this.request(`/rooms/${roomId}`);
  }

  async createRoom(roomData) {
    return await this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(roomId, roomData) {
    return await this.request(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(roomId) {
    return await this.request(`/rooms/${roomId}`, {
      method: 'DELETE',
    });
  }

  async joinRoom(roomId) {
    return await this.request(`/rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveRoom(roomId) {
    return await this.request(`/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  async getRoomMembers(roomId) {
    return await this.request(`/rooms/${roomId}/members`);
  }

  async addRoomMember(roomId, userId) {
    return await this.request(`/rooms/${roomId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeRoomMember(roomId, userId) {
    return await this.request(`/rooms/${roomId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Message endpoints
  async getMessages(roomId, page = 1, limit = 50) {
    return await this.request(`/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(roomId, content, messageType = 'text') {
    return await this.request(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType }),
    });
  }

  async editMessage(messageId, content) {
    return await this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId) {
    return await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async markMessagesAsRead(roomId, messageIds) {
    return await this.request(`/rooms/${roomId}/messages/read`, {
      method: 'POST',
      body: JSON.stringify({ messageIds }),
    });
  }

  // File upload endpoints
  async uploadFile(file, roomId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    return await this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  }

  async getFileUrl(fileId) {
    return await this.request(`/files/${fileId}`);
  }

  async deleteFile(fileId) {
    return await this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20) {
    return await this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId) {
    return await this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return await this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  async deleteNotification(notificationId) {
    return await this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Settings endpoints
  async getSettings() {
    return await this.request('/user/settings');
  }

  async updateSettings(settings) {
    return await this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Analytics endpoints
  async trackEvent(eventName, properties = {}) {
    return await this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ eventName, properties }),
    });
  }

  async getChatStatistics() {
    return await this.request('/analytics/chat-stats');
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;