// Socket.IO service for real-time notifications
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notifications';

type SocketEventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, SocketEventCallback[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Connect to the notification WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

    console.log('Connecting to WebSocket server:', `${WS_BASE_URL}/notifications`);

    this.socket = io(`${WS_BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
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
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification server:', reason);
      this.isConnected = false;
      this.emit('disconnected', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection_failed', { error: 'Failed to connect after maximum attempts' });
      }
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
      console.log('Disconnecting from notification server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
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
