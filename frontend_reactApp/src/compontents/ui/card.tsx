import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type CardProps = {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

type CardSectionProps = {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

type CardTextProps = {
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
};

// Main Card container
export const Card: React.FC<CardProps> = ({ style, children }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

// Header section
export const CardHeader: React.FC<CardSectionProps> = ({ style, children }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

// Title text
export const CardTitle: React.FC<CardTextProps> = ({ style, children }) => {
  return <Text style={[styles.title, style]}>{children}</Text>;
};

// Description text
export const CardDescription: React.FC<CardTextProps> = ({ style, children }) => {
  return <Text style={[styles.description, style]}>{children}</Text>;
};

// Content section
export const CardContent: React.FC<CardSectionProps> = ({ style, children }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

// Footer section
export const CardFooter: React.FC<CardSectionProps> = ({ style, children }) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

// Styles
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB", // neutral border (similar to bg-card border)
    backgroundColor: "#FFFFFF", // bg-card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "column",
    gap: 6,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827", // text-card-foreground
  },
  description: {
    fontSize: 14,
    color: "#6B7280", // text-muted-foreground
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 0,
  },
});
