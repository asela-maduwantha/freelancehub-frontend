'use client';

import { Provider } from 'react-redux';
import { store } from '../../store';
import AuthHydration from './AuthHydration';
import SocketProvider from './SocketProvider';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthHydration>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthHydration>
    </Provider>
  );
}