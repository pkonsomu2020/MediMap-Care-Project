// popover.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}

const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerPosition: { x: number; y: number; width: number; height: number };
  setTriggerPosition: (position: any) => void;
}>({
  open: false,
  setOpen: () => {},
  triggerPosition: { x: 0, y: 0, width: 0, height: 0 },
  setTriggerPosition: () => {},
});

const Popover = ({ children }: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerPosition, setTriggerPosition }}>
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({ children, asChild }: PopoverTriggerProps) => {
  const { setOpen, setTriggerPosition } = React.useContext(PopoverContext);
  const triggerRef = useRef<View>(null);

  const measureTrigger = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerPosition({ x, y, width, height });
        setOpen(true);
      });
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onPress: measureTrigger,
    } as any);
  }

  return (
    <TouchableOpacity ref={triggerRef} onPress={measureTrigger}>
      {children}
    </TouchableOpacity>
  );
};

const PopoverContent = ({ children, style }: PopoverContentProps) => {
  const { open, setOpen, triggerPosition } = React.useContext(PopoverContext);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const calculatePosition = () => {
    const contentWidth = 280;
    const contentHeight = 200;
    
    let left = triggerPosition.x;
    let top = triggerPosition.y + triggerPosition.height + 4;

    // Adjust if going off screen
    if (left + contentWidth > screenWidth) {
      left = screenWidth - contentWidth - 8;
    }
    if (top + contentHeight > screenHeight) {
      top = triggerPosition.y - contentHeight - 4;
    }

    return { left, top };
  };

  const position = calculatePosition();

  if (!open) return null;

  return (
    <Modal transparent visible={open} animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <View style={[styles.content, { ...position }, style]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});

export { Popover, PopoverTrigger, PopoverContent };