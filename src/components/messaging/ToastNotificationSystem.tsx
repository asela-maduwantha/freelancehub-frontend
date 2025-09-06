'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Bell, CheckCircle } from 'lucide-react';
import { webSocketService } from '@/lib/utils/websocket.service';

interface ToastNotification {
  id: string;
  type: 'message' | 'notification' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

const getToastIcon = (type: ToastNotification['type']) => {
  switch (type) {
    case 'message':
      return MessageCircle;
    case 'notification':
      return Bell;
    case 'success':
      return CheckCircle;
    default:
      return Bell;
  }
};

const getToastStyles = (type: ToastNotification['type']) => {
  switch (type) {
    case 'message':
      return 'bg-blue-500 text-white';
    case 'notification':
      return 'bg-gray-800 text-white';
    case 'success':
      return 'bg-green-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-800 text-white';
  }
};

export default function ToastNotificationSystem() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    setupWebSocketListeners();

    return () => {
      webSocketService.off('new_message');
      webSocketService.off('notification');
    };
  }, []);

  const setupWebSocketListeners = () => {
    webSocketService.on('new_message', (data) => {
      addToast({
        id: `message-${Date.now()}`,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${data.senderName || 'someone'}`,
        timestamp: Date.now()
      });
    });

    webSocketService.on('notification', (data) => {
      addToast({
        id: `notification-${Date.now()}`,
        type: 'notification',
        title: data.notification.title,
        message: data.notification.content,
        timestamp: Date.now()
      });
    });
  };

  const addToast = (toast: ToastNotification) => {
    setToasts(prev => [toast, ...prev].slice(0, 5)); // Keep max 5 toasts

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleToastClick = (toast: ToastNotification) => {
    // Handle navigation or action based on toast type
    removeToast(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = getToastIcon(toast.type);
        const styles = getToastStyles(toast.type);

        return (
          <div
            key={toast.id}
            className={`${styles} rounded-lg shadow-lg p-4 min-w-80 max-w-md cursor-pointer transform transition-all duration-300 hover:scale-105`}
            onClick={() => handleToastClick(toast)}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="p-1 hover:bg-black hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="mt-3 bg-black bg-opacity-20 rounded-full h-1">
              <div
                className="bg-white h-1 rounded-full transition-all duration-75 ease-linear"
                style={{
                  width: '100%',
                  animation: 'shrink 5s linear forwards'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Add CSS animation for progress bar
const styles = `
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
