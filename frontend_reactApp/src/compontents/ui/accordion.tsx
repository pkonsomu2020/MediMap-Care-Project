import React, { useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";

type AccordionProps = {
  children: React.ReactNode;
};

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
};

export const Accordion: React.FC<AccordionProps> = ({ children }) => {
  return <View>{children}</View>;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // Adjust this max height as needed
  });

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={toggle} style={styles.trigger}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color="#000" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ overflow: "hidden", height: contentHeight }}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    paddingVertical: 8,
  },
});
