import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  View,
} from "react-native";

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "hero"
  | "success";

type Size = "default" | "sm" | "lg" | "xl" | "icon";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  children,
  onPress,
  disabled,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    disabled && styles.disabled,
    style,
  ];

  const textVariant =
    variant === "link"
      ? [styles.textLink, textStyle]
      : [styles.text, textStyle];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={textVariant}>{children}</Text>
      ) : (
        <View>{children}</View>
      )}
    </Pressable>
  );
};

// Base styling
const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    transitionDuration: "300ms",
  } as ViewStyle,
  text: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  } as TextStyle,
  textLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  } as TextStyle,
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Variant styling
const variantStyles: Record<Variant, ViewStyle> = {
  default: {
    backgroundColor: "#007AFF",
  },
  destructive: {
    backgroundColor: "#FF3B30",
  },
  outline: {
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
  },
  secondary: {
    backgroundColor: "#A1A1AA",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  link: {
    backgroundColor: "transparent",
  },
  hero: {
    backgroundColor: "#6C63FF",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  success: {
    backgroundColor: "#22C55E",
  },
};

// Size styling
const sizeStyles: Record<Size, ViewStyle> = {
  default: { height: 40, paddingHorizontal: 16 },
  sm: { height: 36, paddingHorizontal: 12 },
  lg: { height: 48, paddingHorizontal: 24 },
  xl: { height: 56, paddingHorizontal: 28 },
  icon: { height: 40, width: 40, justifyContent: "center" },
};
