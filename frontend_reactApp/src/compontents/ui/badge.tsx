import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  label,
  style,
  textStyle,
  children,
}) => {
  const variantStyle =
    variant === "secondary"
      ? styles.secondary
      : variant === "destructive"
      ? styles.destructive
      : variant === "outline"
      ? styles.outline
      : styles.default;

  const variantText =
    variant === "outline" ? styles.textOutline : styles.textDefault;

  return (
    <View style={[styles.badge, variantStyle, style]}>
      <Text style={[styles.text, variantText, textStyle]}>
        {label || children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  default: {
    backgroundColor: "#2563eb", // primary
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
    borderColor: "transparent",
  },
  destructive: {
    backgroundColor: "#ef4444",
    borderColor: "transparent",
  },
  outline: {
    borderColor: "#111",
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textDefault: {
    color: "#fff",
  },
  textOutline: {
    color: "#111",
  },
});
