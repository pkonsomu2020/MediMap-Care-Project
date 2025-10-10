// sonner.tsx
import React from 'react';
import { View, Text } from 'react-native';

// Simple toast implementation for React Native
export const toast = {
  success: (message: string) => {
    console.log('Toast success:', message);
    // You might want to use a toast library like react-native-toast-message
  },
  error: (message: string) => {
    console.log('Toast error:', message);
  },
  info: (message: string) => {
    console.log('Toast info:', message);
  },
  warning: (message: string) => {
    console.log('Toast warning:', message);
  },
};

export const Toaster = () => {
  // This would integrate with a toast library
  return null;
};