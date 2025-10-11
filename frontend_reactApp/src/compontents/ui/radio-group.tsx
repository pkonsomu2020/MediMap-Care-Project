// radio-group.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Circle } from 'lucide-react-native';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: any;
}

interface RadioGroupItemProps {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: any;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  ({ value, onValueChange, children, style, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <View ref={ref} style={[styles.group, style]} {...props}>
          {children}
        </View>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<TouchableOpacity, RadioGroupItemProps>(
  ({ value, disabled, children, style, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext);
    const isSelected = selectedValue === value;

    const handlePress = () => {
      if (!disabled) {
        onValueChange?.(value);
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.item, disabled && styles.itemDisabled, style]}
        onPress={handlePress}
        disabled={disabled}
        {...props}
      >
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && (
            <Circle size={12} fill="#3b82f6" color="#3b82f6" />
          )}
        </View>
        {children && (
          <View style={styles.labelContainer}>
            {children}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#3b82f6',
  },
  labelContainer: {
    flex: 1,
  },
});

export { RadioGroup, RadioGroupItem };