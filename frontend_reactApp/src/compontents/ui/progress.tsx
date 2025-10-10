// progress.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  LayoutAnimation,
} from 'react-native';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  style?: any;
  animated?: boolean;
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ value = 0, max = 100, animated = true, style, ...props }, ref) => {
    const progress = Math.max(0, Math.min(100, (value / max) * 100));
    
    React.useEffect(() => {
      if (animated) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    }, [progress, animated]);

    return (
      <View
        ref={ref}
        style={[styles.track, style]}
        {...props}
      >
        <Animated.View
          style={[
            styles.progress,
            { width: `${progress}%` }
          ]}
        />
      </View>
    );
  }
);

Progress.displayName = "Progress";

const styles = StyleSheet.create({
  track: {
    height: 16,
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
});

export { Progress };