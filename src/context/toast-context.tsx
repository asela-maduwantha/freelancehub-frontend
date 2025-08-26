"use client";
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback toast implementation when context is not available
    return {
      success: (message: string) => console.log('Success:', message),
      error: (message: string) => console.error('Error:', message),
      info: (message: string) => console.info('Info:', message),
      warning: (message: string) => console.warn('Warning:', message),
    };
  }
  return context;
}

export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.info('Info:', message),
  warning: (message: string) => console.warn('Warning:', message),
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toastActions: ToastContextType = {
    success: (message: string) => {
      // In a real implementation, you'd show a toast notification
      console.log('Success:', message);
    },
    error: (message: string) => {
      console.error('Error:', message);
    },
    info: (message: string) => {
      console.info('Info:', message);
    },
    warning: (message: string) => {
      console.warn('Warning:', message);
    },
  };

  return (
    <ToastContext.Provider value={toastActions}>
      {children}
    </ToastContext.Provider>
  );
}
