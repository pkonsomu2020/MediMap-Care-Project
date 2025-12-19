// scroll-area.tsx
import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';

interface ScrollAreaProps extends ScrollViewProps {
  className?: string;
}

const ScrollArea = React.forwardRef<ScrollView, ScrollAreaProps>(
  ({ className, style, children, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        style={[styles.scrollView, style]}
        showsVerticalScrollIndicator={true}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

export { ScrollArea };