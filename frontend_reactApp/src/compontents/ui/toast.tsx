// toast.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { X } from 'lucide-react-native';

interface ToastContextType {
  toast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastOptions {
  duration?: number;
  type?: 'default' | 'destructive';
}

interface ToastItem extends ToastOptions {
  id: string;
  message: string;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (message: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36);
    const newToast: ToastItem = { id, message, ...options };
    
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, options.duration || 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View style={{ position: 'absolute', top: 50, left: 20, right: 20, zIndex: 1000 }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

interface ToastProps {
  message: string;
  type?: 'default' | 'destructive';
}

const Toast: React.FC<ToastProps> = ({ message, type = 'default' }) => {
  const opacity = new Animated.Value(0);

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2700),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        backgroundColor: type === 'destructive' ? '#ef4444' : 'white',
        padding: 16,
        borderRadius: 6,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: type === 'default' ? 1 : 0,
        borderColor: '#e2e8f0',
      }}
    >
      <Text style={{ color: type === 'destructive' ? 'white' : 'black', fontSize: 14 }}>
        {message}
      </Text>
    </Animated.View>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const toast = (message: string, options?: ToastOptions) => {
  // This would need to be implemented with a global toast manager
  console.warn('toast function called outside of ToastProvider');
};