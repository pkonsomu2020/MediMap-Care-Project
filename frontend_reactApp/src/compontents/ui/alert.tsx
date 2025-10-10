import React from "react";
import { View, Text, StyleSheet } from "react-native";

type AlertProps = {
  variant?: "default" | "destructive";
  children: React.ReactNode;
  style?: object;
};

type AlertTitleProps = {
  children: React.ReactNode;
  style?: object;
};

type AlertDescriptionProps = {
  children: React.ReactNode;
  style?: object;
};

export const Alert: React.FC<AlertProps> = ({
  variant = "default",
  children,
  style,
}) => {
  const variantStyle =
    variant === "destructive"
      ? styles.destructive
      : styles.default;

  return <View style={[styles.alert, variantStyle, style]}>{children}</View>;
};

export const AlertTitle: React.FC<AlertTitleProps> = ({
  children,
  style,
}) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  style,
}) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  alert: {
    position: "relative",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  default: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  destructive: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  title: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
});
