import React from "react";
import { View, Image, Text, StyleSheet, ImageSourcePropType } from "react-native";

type AvatarProps = {
  size?: number;
  children?: React.ReactNode;
  style?: object;
};

type AvatarImageProps = {
  source: ImageSourcePropType;
  style?: object;
};

type AvatarFallbackProps = {
  children?: React.ReactNode;
  style?: object;
};

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  children,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ source, style }) => (
  <Image source={source} style={[styles.image, style]} />
);

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  children,
  style,
}) => (
  <View style={[styles.fallback, style]}>
    {typeof children === "string" ? (
      <Text style={styles.fallbackText}>{children}</Text>
    ) : (
      children
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  fallbackText: {
    color: "#6b7280",
    fontWeight: "600",
  },
});
