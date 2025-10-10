import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";

// Enable layout animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const Collapsible = ({ children, open: controlledOpen, onOpenChange }) => {
  const [open, setOpen] = useState(controlledOpen ?? false);

  useEffect(() => {
    if (controlledOpen !== undefined) setOpen(controlledOpen);
  }, [controlledOpen]);

  const toggle = () => {
    const newState = !open;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(newState);
    onOpenChange?.(newState);
  };

  // Allow nested usage similar to Radix
  const trigger = [];
  const content = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === CollapsibleTrigger) {
      trigger.push(React.cloneElement(child, { onPress: toggle }));
    } else if (child.type === CollapsibleContent) {
      content.push(React.cloneElement(child, { open }));
    }
  });

  return (
    <View>
      {trigger}
      {content}
    </View>
  );
};

export const CollapsibleTrigger = ({ children, onPress, style }) => (
  <Pressable onPress={onPress} style={[styles.trigger, style]}>
    {children}
  </Pressable>
);

export const CollapsibleContent = ({ children, open, style }) => {
  const animatedHeight = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [open]);

  return (
    <Animated.View
      style={[
        styles.content,
        style,
        {
          height: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, "auto"],
          }),
          opacity: animatedHeight,
        },
      ]}
    >
      {open ? children : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  content: {
    overflow: "hidden",
  },
});
