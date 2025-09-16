// Simple createStore function
const createStore = (reducer: any) => {
  let state: any;
  let listeners: any[] = [];

  const getState = () => state;

  const dispatch = (action: any) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };

  const subscribe = (listener: any) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  dispatch({ type: '@@redux/INIT' });

  return { getState, dispatch, subscribe };
};

import rootReducer from './rootReducer';

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;