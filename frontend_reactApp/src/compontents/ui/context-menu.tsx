// context-menu.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Check, ChevronRight, Circle } from 'lucide-react-native';

interface ContextMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

interface ContextMenuContentProps {
  children: React.ReactNode;
  style?: any;
}

interface ContextMenuItemProps {
  onSelect?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: any;
}

const ContextMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
}>({
  open: false,
  setOpen: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
});

const ContextMenu = ({ children, trigger }: ContextMenuProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setPosition({ x: pageX, y: pageY });
    setOpen(true);
  };

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, position, setPosition }}>
      <TouchableOpacity onLongPress={handleLongPress} delayLongPress={500}>
        {trigger}
      </TouchableOpacity>
      {children}
    </ContextMenuContext.Provider>
  );
};

const ContextMenuContent = ({ children, style }: ContextMenuContentProps) => {
  const { open, setOpen, position } = React.useContext(ContextMenuContext);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const calculatePosition = () => {
    const contentWidth = 200;
    const contentHeight = 200;
    
    let left = position.x;
    let top = position.y;

    // Adjust if going off screen
    if (left + contentWidth > screenWidth) {
      left = screenWidth - contentWidth - 8;
    }
    if (top + contentHeight > screenHeight) {
      top = screenHeight - contentHeight - 8;
    }

    return { left, top };
  };

  const menuPosition = calculatePosition();

  if (!open) return null;

  return (
    <Modal transparent visible={open} animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <View style={[styles.content, { left: menuPosition.left, top: menuPosition.top }, style]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ContextMenuItem = ({ onSelect, children, disabled, style }: ContextMenuItemProps) => {
  const { setOpen } = React.useContext(ContextMenuContext);

  const handlePress = () => {
    if (!disabled) {
      onSelect?.();
      setOpen(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.item, disabled && styles.itemDisabled, style]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.itemText, disabled && styles.itemTextDisabled]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const ContextMenuSeparator = ({ style }: any) => (
  <View style={[styles.separator, style]} />
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
  },
  itemTextDisabled: {
    color: '#9ca3af',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
});

export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
};