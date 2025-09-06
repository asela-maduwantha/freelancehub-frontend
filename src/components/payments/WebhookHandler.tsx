'use client';

import { useEffect } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { paymentsService } from '../../lib/api/payments.service';

export function WebhookHandler() {
  const { addWebhookEvent, processWebhookEvent, realTimeUpdates } = usePaymentStore();

  useEffect(() => {
    if (!realTimeUpdates) return;

    // Simulate webhook handling (in production, this would be server-side)
    const handleWebhook = (event: any) => {
      addWebhookEvent({
        id: event.id || `webhook-${Date.now()}`,
        type: event.type,
        data: event.data,
        created: event.created || Date.now() / 1000,
        processed: false
      });

      // Process the webhook event
      processWebhookEvent({
        id: event.id || `webhook-${Date.now()}`,
        type: event.type,
        data: event.data,
        created: event.created || Date.now() / 1000,
        processed: false
      });
    };

    // Listen for storage events (simulating webhook events)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'payment-webhook-event') {
        try {
          const event = JSON.parse(e.newValue || '{}');
          handleWebhook(event);
        } catch (error) {
          console.error('Failed to parse webhook event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    // Poll for webhook events (fallback for real-time updates)
    const pollWebhooks = async () => {
      try {
        const events = await paymentsService.getWebhookEvents();
        events.forEach(event => {
          if (!event.processed) {
            processWebhookEvent(event);
          }
        });
      } catch (error) {
        console.error('Failed to poll webhooks:', error);
      }
    };

    // Poll every 30 seconds
    const pollInterval = setInterval(pollWebhooks, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(pollInterval);
    };
  }, [realTimeUpdates, addWebhookEvent, processWebhookEvent]);

  // This component doesn't render anything visible
  return null;
}

// Utility function to simulate webhook events (for testing)
export const simulateWebhookEvent = (event: any) => {
  localStorage.setItem('payment-webhook-event', JSON.stringify(event));
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'payment-webhook-event',
    newValue: JSON.stringify(event)
  }));
};
