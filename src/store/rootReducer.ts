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
});

export default rootReducer;