import React, { useState } from "react";
import { Pressable, View, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/Feather";

type CheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  style?: object;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 24,
  color = "#2563eb", // Default primary color
  style,
}) => {
  const [isChecked, setChecked] = useState(checked);
  const animatedValue = new Animated.Value(isChecked ? 1 : 0);

  const toggle = () => {
    if (disabled) return;
    const newState = !isChecked;
    setChecked(newState);
    onChange?.(newState);

    Animated.timing(animatedValue, {
      toValue: newState ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      style={[
        styles.box,
        {
          borderColor: isChecked ? color : "#d1d5db",
          backgroundColor: isChecked ? color : "#fff",
          opacity: disabled ? 0.5 : 1,
          width: size,
          height: size,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
            },
          ],
        }}
      >
        {isChecked && <Icon name="check" size={size * 0.7} color="#fff" />}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
