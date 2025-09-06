'use client';

import { useState, useEffect } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { Button } from '../ui/Button';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface AutoReleaseTimerProps {
  paymentId: string;
  endTime: string;
  onExpire?: () => void;
}

export function AutoReleaseTimer({ paymentId, endTime, onExpire }: AutoReleaseTimerProps) {
  const { autoReleaseTimer, startAutoReleaseTimer, stopAutoReleaseTimer } = usePaymentStore();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (endTime) {
      startAutoReleaseTimer(paymentId, endTime);
      setIsRunning(true);
    }

    return () => {
      stopAutoReleaseTimer();
    };
  }, [paymentId, endTime]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getProgressPercentage = () => {
    const total = 7 * 24 * 60 * 60; // 7 days in seconds (default)
    const remaining = autoReleaseTimer;
    const elapsed = total - remaining;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getStatusColor = () => {
    if (autoReleaseTimer <= 0) return 'text-red-600';
    if (autoReleaseTimer <= 3600) return 'text-orange-600'; // Less than 1 hour
    if (autoReleaseTimer <= 86400) return 'text-yellow-600'; // Less than 1 day
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (autoReleaseTimer <= 0) return 'bg-red-500';
    if (autoReleaseTimer <= 3600) return 'bg-orange-500';
    if (autoReleaseTimer <= 86400) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (autoReleaseTimer <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Auto-release Expired</p>
              <p className="text-xs text-red-600">Payment can now be released automatically</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onExpire}
            className="bg-red-600 hover:bg-red-700"
          >
            Release Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Clock className={`w-5 h-5 ${getStatusColor()}`} />
          <div>
            <p className="text-sm font-medium text-blue-800">Auto-release Timer</p>
            <p className={`text-lg font-bold ${getStatusColor()}`}>
              {formatTime(autoReleaseTimer)}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {isRunning ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                stopAutoReleaseTimer();
                setIsRunning(false);
              }}
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                startAutoReleaseTimer(paymentId, endTime);
                setIsRunning(true);
              }}
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              stopAutoReleaseTimer();
              setIsRunning(false);
              // Reset to original time
              startAutoReleaseTimer(paymentId, endTime);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-blue-600 mt-1">
        <span>Started</span>
        <span>Auto-release</span>
      </div>

      {autoReleaseTimer <= 86400 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            ⚠️ Auto-release will occur in less than 24 hours
          </p>
        </div>
      )}
    </div>
  );
}
