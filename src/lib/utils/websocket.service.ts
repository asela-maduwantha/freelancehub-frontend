import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, TypingIndicator } from '../types';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isDestroyed = false;

  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    // Don't connect automatically - wait for manual connect() call
    // This prevents connection before login
  }

  // Public method to manually connect
  async connect(): Promise<void> {
    if (this.isDestroyed) return;
    
    if (typeof window === 'undefined') return;

    // If already connected, don't reconnect
    if (this.socket?.connected) {
      return;
    }

    await this.connectInternal();
  }

  private async connectInternal() {
    // Prevent multiple concurrent connection attempts
    if (this.isConnecting || this.isDestroyed) return;
    
    if (typeof window === 'undefined') return;

    this.isConnecting = true;

    try {
      // Clean up existing connection
      await this.disconnect();

      const token = this.getToken();
      if (!token) {
        console.warn('No access token found, WebSocket connection may fail');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace('http', 'ws');

      this.socket = io(`${WS_URL}/messaging`, {
        auth: {
          token: token ? `Bearer ${token}` : null
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true // Force new connection
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('connection_error', error);
    } finally {
      this.isConnecting = false;
    }
  }

  private getToken(): string | null {
    try {
      // Add fallback methods for getting token
      if (typeof window === 'undefined') return null;
      
      // Try localStorage first
      let token = localStorage.getItem('accessToken');
      
      // Could also try sessionStorage or cookies as fallback
      if (!token) {
        token = sessionStorage.getItem('accessToken');
      }
      
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Clear any existing reconnection timer
    this.clearReconnectTimer();

    this.socket.on('connect', () => {
      console.log('Connected to messaging WebSocket');
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from messaging WebSocket:', reason);
      this.emit('disconnected', reason);
      
      // Only auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connection_error', error);
      
      // Handle authentication errors differently
      if (error.message?.includes('authentication') || error.message?.includes('401')) {
        this.emit('auth_error', error);
        return; // Don't auto-reconnect on auth errors
      }
      
      this.handleReconnect();
    });

    // Message events
    this.socket.on('new_message', (data) => {
      try {
        this.emit('new_message', data);
      } catch (error) {
        console.error('Error handling new_message:', error);
      }
    });

    this.socket.on('message_sent', (data) => {
      try {
        this.emit('message_sent', data);
      } catch (error) {
        console.error('Error handling message_sent:', error);
      }
    });

    // User presence events
    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    // Typing indicators
    this.socket.on('typing_start', (data) => {
      this.emit('typing_start', data);
    });

    this.socket.on('typing_stop', (data) => {
      this.emit('typing_stop', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });
  }

  private handleReconnect() {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('max_reconnect_attempts_reached');
      }
      return;
    }

    this.clearReconnectTimer();
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Exponential backoff with max 30s
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectInternal();
      }
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Event system
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    // Return cleanup function
    return () => this.off(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Messaging methods
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', { conversationId });
    } else {
      console.warn('Cannot join conversation: WebSocket not connected');
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  sendMessage(conversationId: string, content: string, type: 'text' | 'file' = 'text') {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { conversationId, content, type });
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      this.emit('send_failed', { conversationId, content, type, reason: 'not_connected' });
    }
  }

  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  async disconnect(): Promise<void> {
    this.clearReconnectTimer();
    
    if (this.socket) {
      return new Promise((resolve) => {
        this.socket!.disconnect();
        // Give it a moment to clean up
        setTimeout(() => {
          this.socket = null;
          resolve();
        }, 100);
      });
    }
  }

  // Method to refresh connection with new token
  async refreshConnection(newToken?: string) {
    if (newToken && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newToken);
    }
    
    this.reconnectAttempts = 0; // Reset attempts for manual refresh
    await this.connectInternal();
  }

  // Cleanup
  async destroy() {
    this.isDestroyed = true;
    this.clearReconnectTimer();
    await this.disconnect();
    this.eventListeners.clear();
  }
}

// Use a factory function instead of direct instantiation to avoid SSR issues
let webSocketServiceInstance: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      on: () => () => {},
      off: () => {},
      joinConversation: () => {},
      leaveConversation: () => {},
      sendMessage: () => {},
      startTyping: () => {},
      stopTyping: () => {},
      isConnected: () => false,
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      refreshConnection: () => Promise.resolve(),
      destroy: () => Promise.resolve(),
    } as any;
  }

  if (!webSocketServiceInstance) {
    webSocketServiceInstance = new WebSocketService();
  }
  
  return webSocketServiceInstance;
};