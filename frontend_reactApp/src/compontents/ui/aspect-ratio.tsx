import React from "react";
import { View, StyleSheet } from "react-native";

type AspectRatioProps = {
  ratio?: number; // e.g. 16/9
  children: React.ReactNode;
  style?: object;
};

export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 1,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, { aspectRatio: ratio }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
