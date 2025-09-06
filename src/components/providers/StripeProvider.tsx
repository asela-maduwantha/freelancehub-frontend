'use client';

import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';
import { stripePromise, STRIPE_CONFIG } from '../../lib/config/stripe.config';

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise} options={STRIPE_CONFIG.options}>
      {children}
    </Elements>
  );
}
