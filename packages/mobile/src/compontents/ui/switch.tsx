// switch.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Animated } from 'react-native';

interface SwitchProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  style?: any;
}

export const Switch: React.FC<SwitchProps> = ({ value = false, onValueChange, style }) => {
  const [isOn, setIsOn] = useState(value);
  const translateX = new Animated.Value(isOn ? 16 : 0);

  const toggleSwitch = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onValueChange?.(newValue);

    Animated.timing(translateX, {
      toValue: newValue ? 16 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={toggleSwitch}
      style={[
        {
          width: 44,
          height: 24,
          borderRadius: 12,
          backgroundColor: isOn ? '#3b82f6' : '#d1d5db',
          padding: 2,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'white',
          transform: [{ translateX }],
        }}
      />
    </TouchableOpacity>
  );
};