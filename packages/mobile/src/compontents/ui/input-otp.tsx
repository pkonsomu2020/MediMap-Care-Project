// input-otp.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Dot } from 'lucide-react-native';

interface InputOTPProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
}

interface InputOTPSlotProps {
  index: number;
  value: string;
  isActive: boolean;
  onPress: () => void;
}

const InputOTP = React.forwardRef<TextInput, InputOTPProps>(
  ({ length = 6, value = '', onChange, onComplete, disabled, ...props }, ref) => {
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const inputs = useRef<TextInput[]>([]);

    const handleChange = (text: string, index: number) => {
      if (disabled) return;

      const newValue = value.split('');
      
      if (text.length === length) {
        // Pasted value
        const pastedValue = text.slice(0, length);
        onChange?.(pastedValue);
        if (pastedValue.length === length) {
          onComplete?.(pastedValue);
        }
        setFocusedIndex(Math.min(pastedValue.length, length - 1));
        return;
      }

      if (text.length > 1) {
        // Multiple characters (likely from paste)
        return;
      }

      newValue[index] = text;
      const newValueStr = newValue.join('');
      onChange?.(newValueStr);

      if (text && index < length - 1) {
        // Move to next input
        inputs.current[index + 1]?.focus();
      }

      if (newValueStr.length === length && newValueStr.replace(/\s/g, '').length === length) {
        onComplete?.(newValueStr);
      }
    };

    const handleKeyPress = (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
        // Move to previous input on backspace
        inputs.current[index - 1]?.focus();
      }
    };

    const handleFocus = (index: number) => {
      setFocusedIndex(index);
    };

    const handleBlur = () => {
      setFocusedIndex(-1);
    };

    return (
      <View style={styles.container}>
        {Array.from({ length }).map((_, index) => (
          <React.Fragment key={index}>
            <InputOTPSlot
              index={index}
              value={value[index] || ''}
              isActive={focusedIndex === index}
              onPress={() => inputs.current[index]?.focus()}
            />
            <TextInput
              ref={(el) => {
                if (el) inputs.current[index] = el;
              }}
              style={styles.hiddenInput}
              value={value[index] || ''}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              maxLength={index === 0 ? length : 1}
              keyboardType="number-pad"
              editable={!disabled}
              selectTextOnFocus
            />
          </React.Fragment>
        ))}
      </View>
    );
  }
);

InputOTP.displayName = "InputOTP";

const InputOTPSlot = ({ index, value, isActive, onPress }: InputOTPSlotProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        isActive && styles.slotActive,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.slotText}>
        {value}
      </Text>
      {isActive && !value && (
        <View style={styles.caret} />
      )}
    </TouchableOpacity>
  );
};

const InputOTPGroup = ({ children, style }: any) => (
  <View style={[styles.group, style]}>{children}</View>
);

const InputOTPSeparator = ({ style }: any) => (
  <View style={[styles.separator, style]}>
    <Dot size={16} color="#6b7280" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slot: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  slotActive: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  slotText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  caret: {
    width: 2,
    height: 20,
    backgroundColor: '#1f2937',
    borderRadius: 1,
  },
  separator: {
    paddingHorizontal: 8,
  },
});

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };