// Socket.IO service for real-time notifications
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notifications';

type SocketEventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private listeners: Map<string, SocketEventCallback[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentToken: string | null = null;

  /**
   * Connect to the notification WebSocket server
   */
  connect(token: string): void {
    // Prevent duplicate connections
    if (this.isConnecting) {
      console.log('⏳ Connection already in progress, skipping...');
      return;
    }

    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      // If token changed, reconnect with new token
      if (this.currentToken !== token) {
        console.log('🔄 Token changed, reconnecting...');
        this.disconnect();
      } else {
        return;
      }
    }

    // If socket exists but is disconnected, clean it up first
    if (this.socket && !this.socket.connected) {
      console.log('🧹 Cleaning up disconnected socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = true;
    this.currentToken = token;

    const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

    // Validate WebSocket URL
    if (!WS_BASE_URL || WS_BASE_URL === 'http://localhost:8000') {
      console.warn('⚠️ WebSocket URL not properly configured or using localhost. Socket connection skipped.');
      console.warn('💡 Make sure your backend WebSocket server is running and NEXT_PUBLIC_WS_URL is set correctly.');
      this.isConnecting = false;
      return;
    }

    console.log('🔌 Connecting to WebSocket server:', `${WS_BASE_URL}/notifications`);
    console.log('🔑 Using token for auth:', token ? 'Token present' : 'No token');
    console.log('🌐 Environment WS_URL:', process.env.NEXT_PUBLIC_WS_URL);

    this.socket = io(`${WS_BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000, // 20 second connection timeout
      autoConnect: true,
      withCredentials: false,
    });

    this.setupSocketListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to notification server');
      console.log('🔗 Socket ID:', this.socket?.id);
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification server:', reason);
      console.log('🔌 Socket ID:', this.socket?.id);
      this.isConnected = false;
      this.emit('disconnected', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message || error);
      console.error('🔍 Connection details:', {
        auth: !!this.socket?.auth,
        transport: this.socket?.io?.engine?.transport?.name,
        readyState: this.socket?.io?.engine?.readyState
      });
      this.isConnecting = false;
      this.reconnectAttempts++;

      // Only emit connection_failed after max attempts, don't log it every time
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚫 Max reconnection attempts reached');
        this.emit('connection_failed', { error: 'Failed to connect after maximum attempts' });
        // Stop trying to reconnect after max attempts
        this.socket?.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to notification server after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🚫 Reconnection failed');
      this.emit('reconnection_failed', { error: 'Reconnection failed' });
    });

    // Notification events from server
    this.socket.on('notification', (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      this.emit('notification', notification);
    });

    this.socket.on('unread_count', (data: { count: number }) => {
      console.log('🔔 Unread count update:', data.count);
      this.emit('unread_count', data.count);
    });

    this.socket.on('notification_updated', (data: any) => {
      console.log('🔄 Notification updated:', data);
      this.emit('notification_updated', data);
    });

    this.socket.on('all_notifications_read', () => {
      console.log('✅ All notifications marked as read');
      this.emit('all_notifications_read', null);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting from notification server');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.currentToken = null;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket should reconnect (not connected but should be)
   */
  shouldReconnect(token: string): boolean {
    return !this.isConnected && !!token;
  }

  /**
   * Reconnect with new token (useful when auth state is restored)
   */
  reconnect(token: string): void {
    console.log('🔄 Reconnecting socket with new token...');
    this.disconnect();
    this.connect(token);
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Send mark as read event to server
   */
  markAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      console.log('📤 Sending mark_as_read:', notificationId);
      this.socket.emit('mark_as_read', { notificationId });
    } else {
      console.warn('Cannot send mark_as_read: socket not connected');
    }
  }

  /**
   * Send mark all as read event to server
   */
  markAllAsRead(): void {
    if (this.socket?.connected) {
      console.log('📤 Sending mark_all_read');
      this.socket.emit('mark_all_read');
    } else {
      console.warn('Cannot send mark_all_read: socket not connected');
    }
  }

  /**
   * Request unread count from server
   */
  getUnreadCount(): void {
    if (this.socket?.connected) {
      console.log('📤 Requesting unread count');
      this.socket.emit('get_unread_count');
    } else {
      console.warn('Cannot request unread count: socket not connected');
    }
  }

  /**
   * Subscribe to socket events
   */
  on(event: string, callback: SocketEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const callbacks = this.listeners.get(event);
    if (callbacks && !callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }

  /**
   * Unsubscribe from socket events
   */
  off(event: string, callback: SocketEventCallback): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  /**
   * Emit event to local listeners
   */
  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in socket event callback for ${event}:`, error);
          }
        });
      }
    }
  }

  /**
   * Get socket connection status
   */
  getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
