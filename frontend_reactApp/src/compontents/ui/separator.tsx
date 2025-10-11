// separator.tsx
import React from 'react';
import { View } from 'react-native';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: any;
}

export const Separator: React.FC<SeparatorProps> = ({ orientation = 'horizontal', style }) => (
  <View
    style={[
      {
        backgroundColor: '#e2e8f0',
        ...(orientation === 'horizontal' ? { height: 1, width: '100%' } : { width: 1, height: '100%' }),
      },
      style,
    ]}
  />
);