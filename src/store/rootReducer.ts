import { combineReducers } from 'redux';
import authReducer from './slices/auth';
import userReducer from './slices/user';
import jobsReducer from './slices/jobs';
import proposalsReducer from './slices/proposals';
import contractsReducer from './slices/contracts';
import paymentsReducer from './slices/payments';
import messagesReducer from './slices/messages';
import notificationsReducer from './slices/notifications';
import uiReducer from './slices/ui';
import adminReducer from './slices/admin';
import withdrawalsReducer from './slices/withdrawals';
import stripeAccountReducer from './slices/stripe';
import onboardingReducer from './slices/onboarding';
import { clientOnboardingReducer } from './slices/clientOnboarding';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  jobs: jobsReducer,
  proposals: proposalsReducer,
  contracts: contractsReducer,
  payments: paymentsReducer,
  messages: messagesReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
  admin: adminReducer,
  withdrawals: withdrawalsReducer,
  stripeAccount: stripeAccountReducer,
  onboarding: onboardingReducer,
  clientOnboarding: clientOnboardingReducer,
});

export default rootReducer;