// skeleton.tsx
import React from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ style }) => {
  const fadeAnim = new Animated.Value(0.3);

  Animated.loop(
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  ).start();

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#d1d5db',
          borderRadius: 4,
          opacity: fadeAnim,
        },
        style,
      ]}
    />
  );
};