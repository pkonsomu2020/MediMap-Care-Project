// toggle-group.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface ToggleGroupProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  style?: any;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  children,
  type = 'single',
  value,
  onValueChange,
  style,
}) => {
  const handlePress = (itemValue: string) => {
    if (type === 'single') {
      onValueChange?.(itemValue);
    } else {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(itemValue)
        ? currentValue.filter(v => v !== itemValue)
        : [...currentValue, itemValue];
      onValueChange?.(newValue);
    }
  };

  return (
    <View style={[{ flexDirection: 'row', gap: 4 }, style]}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              onPress: handlePress,
              isSelected: type === 'single' 
                ? value === child.props.value
                : Array.isArray(value) && value.includes(child.props.value),
            })
          : child
      )}
    </View>
  );
};

interface ToggleGroupItemProps {
  children: React.ReactNode;
  value: string;
  onPress?: (value: string) => void;
  isSelected?: boolean;
  style?: any;
}

export const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  children,
  value,
  onPress,
  isSelected = false,
  style,
}) => (
  <TouchableOpacity
    onPress={() => onPress?.(value)}
    style={[
      {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: isSelected ? '#3b82f6' : 'transparent',
        borderWidth: 1,
        borderColor: isSelected ? '#3b82f6' : '#d1d5db',
      },
      style,
    ]}
  >
    <Text style={{ color: isSelected ? 'white' : '#6b7280', fontSize: 14 }}>
      {children}
    </Text>
  </TouchableOpacity>
);