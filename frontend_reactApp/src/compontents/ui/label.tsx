// label.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface LabelProps extends TextProps {
  className?: string;
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        style={[styles.label, style]}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export { Label };