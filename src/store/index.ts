import { createStore } from 'redux';
import rootReducer from './rootReducer';

// Redux DevTools Extension type declaration
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

// Redux DevTools Extension support
const composeEnhancers = 
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || 
  ((x: any) => x);

export const store = createStore(
  rootReducer,
  composeEnhancers()
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;