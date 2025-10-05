# Client Onboarding Refactor

## Summary#### Profile Update
```typescript
PUT /users/client/profile
{
  "companyName": "Tech Solutions Inc.",
  "companySize": "11-50",
  "industry": "Technology",
  "logo": "https://example.com/company-logo.png"  // Optional - URL from file upload
}

Response:
{
  "success": true,
  "data": {
    "message": "Client profile updated successfully"
  }
}
```client onboarding process to properly integrate with the backend API endpoints for profile updates and payment method setup using Stripe. Uses **query parameter navigation** (?step=1, ?step=2, ?step=3) for better UX and browser compatibility.

## Navigation System
- **URL Pattern**: `/client/onboarding?step=1` → `/client/onboarding?step=2` → `/client/onboarding?step=3`
- **Progress Tracking**: localStorage stores `client_onboarding_progress` with completedSteps array
- **Email Verification**: After verification, redirects to `/client/onboarding?step=1`
- **Browser Back Button**: Properly supported with query parameters

## Changes Made

### 1. **API Layer** (`src/lib/api/`)
- **Created** `clientApi.ts` - New dedicated API service for client operations
- **Updated** `endpoints.ts` - Added CLIENT section with:
  - `UPDATE_PROFILE`: `/users/client/profile`

### 2. **Client Onboarding Flow**
The client onboarding consists of 2 essential steps:

#### **Step 1: Profile & Company** (`Step1ProfileCompany.tsx`)
- **API**: `PUT /users/client/profile`
- **Fields**: companyName, companySize, industry, logo (optional)
- **Logo Upload**: Uses `fileService.uploadDocument()` to upload logo and get URL
- **Changes**:
  - Now properly calls `clientApi.updateProfile()` with logo URL
  - Logo field is optional - users can skip logo upload
  - Saves data to backend before proceeding
  - Proper error handling and loading states
  - Note: firstName, lastName, companyWebsite are kept in form but not sent to API (as per your API structure)

#### **Step 2: Payment Method** (`Step2PaymentMethod.tsx`)
- **API**: 
  - `POST /payment-methods/setup-intent` - Create setup intent
  - `POST /payment-methods` - Save payment method
  - `GET /payment-methods` - List payment methods
- **Integration**: Stripe Elements for card input
- **To be implemented**: Full Stripe Elements integration

### 3. **API Integration Details**

#### Profile Update
```typescript
PUT /users/client/profile
{
  "companyName": "Tech Solutions Lanka Pvt Ltd",
  "companySize": "51-200",
  "industry": "Information Technology"
}

Response:
{
  "success": true,
  "data": {
    "message": "Client profile updated successfully"
  }
}
```

#### Setup Intent Creation
```typescript
POST /payment-methods/setup-intent

Response:
{
  "success": true,
  "data": {
    "clientSecret": "seti_xxx_secret_xxx",
    "setupIntentId": "seti_xxx"
  }
}
```

#### Save Payment Method
```typescript
POST /payment-methods
{
  "paymentMethodId": "pm_xxx",
  "isDefault": true
}
```

#### Get Payment Methods
```typescript
GET /payment-methods

Response:
{
  "success": true,
  "data": [
    {
      "id": "pm_xxx",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "expMonth": 12,
        "expYear": 2025
      },
      "isDefault": true
    }
  ]
}
```

## Files Modified

1. **`src/lib/api/endpoints.ts`**
   - Added CLIENT section

2. **`src/lib/api/clientApi.ts`** (NEW)
   - `updateProfile()` - Update client company profile
   - `createSetupIntent()` - Create Stripe setup intent
   - `savePaymentMethod()` - Save payment method after Stripe confirmation
   - `getPaymentMethods()` - Get all payment methods
   - `setDefaultPaymentMethod()` - Set default payment method
   - `deletePaymentMethod()` - Delete a payment method

3. **`src/components/features/dashboard/client/onboarding/Step1ProfileCompany.tsx`**
   - Added API integration
   - Added loading states
   - Added error handling
   - Saves to backend before proceeding

## Next Steps for Complete Implementation

### 1. **Step 2: Payment Method Integration**
You'll need to integrate Stripe Elements in `Step2PaymentMethod.tsx`:

```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('your_publishable_key');

// In component:
const stripe = useStripe();
const elements = useElements();

// On submit:
const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
  payment_method: {
    card: elements.getElement(CardElement),
  },
});

if (!error) {
  await clientApi.savePaymentMethod({
    paymentMethodId: setupIntent.payment_method,
    isDefault: true
  });
}
```

### 2. **Install Stripe Dependencies**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. **Environment Variable**
Add to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. **Simplify Navigation**
Consider updating `page.tsx` to use query parameters like the freelancer onboarding:
- Step 1: `?step=1`
- Step 2: `?step=2`

### 5. **Remove Unused Step**
If Step3Preferences is not needed, remove it from the flow.

## Testing Checklist

- [ ] Profile step saves company data correctly
- [ ] Setup intent is created successfully
- [ ] Stripe card element displays properly
- [ ] Payment method is saved after card confirmation
- [ ] Payment methods list displays correctly
- [ ] Error states display properly
- [ ] Loading states show during API calls
- [ ] Navigation between steps works

## Example: Complete Step 2 Integration

Here's a complete example for Step 2:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { clientApi } from '@/lib/api/clientApi';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Step2Content: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create setup intent on mount
    const createIntent = async () => {
      try {
        const response = await clientApi.createSetupIntent();
        setClientSecret(response.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment setup');
      }
    };
    createIntent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Save payment method to backend
      await clientApi.savePaymentMethod({
        paymentMethodId: setupIntent.payment_method as string,
        isDefault: true,
      });

      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        }}
      />
      {error && <p className="text-red-600">{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Add Payment Method'}
      </button>
    </form>
  );
};

const Step2PaymentMethod: React.FC<{ onNext: () => void }> = (props) => (
  <Elements stripe={stripePromise}>
    <Step2Content {...props} />
  </Elements>
);

export default Step2PaymentMethod;
```

## Summary

The client onboarding now:
- ✅ Saves company profile to backend API
- ✅ Has proper error handling
- ✅ Shows loading states
- ⏳ Needs Stripe Elements integration for payment method (template provided above)
- ⏳ Can be simplified with query parameter navigation

The foundation is in place - just needs the Stripe Elements implementation for Step 2!
