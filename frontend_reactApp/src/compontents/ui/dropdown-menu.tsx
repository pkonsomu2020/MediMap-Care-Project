// dropdown-menu.tsx
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

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  style?: any;
}

interface DropdownMenuItemProps {
  onSelect?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  inset?: boolean;
  style?: any;
}

const DropdownMenuContext = React.createContext<{
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

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerPosition, setTriggerPosition }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = ({ children, asChild }: DropdownMenuTriggerProps) => {
  const { setOpen, setTriggerPosition } = React.useContext(DropdownMenuContext);
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

const DropdownMenuContent = ({ children, style }: DropdownMenuContentProps) => {
  const { open, setOpen, triggerPosition } = React.useContext(DropdownMenuContext);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const calculatePosition = () => {
    const contentWidth = 200;
    const contentHeight = 300;
    
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
        <View style={[styles.content, { left: position.left, top: position.top }, style]}>
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const DropdownMenuItem = ({ onSelect, children, disabled, inset, style }: DropdownMenuItemProps) => {
  const { setOpen } = React.useContext(DropdownMenuContext);

  const handlePress = () => {
    if (!disabled) {
      onSelect?.();
      setOpen(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.item,
        inset && styles.itemInset,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.itemText, disabled && styles.itemTextDisabled]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const DropdownMenuLabel = ({ children, inset, style }: any) => (
  <Text style={[styles.label, inset && styles.labelInset, style]}>
    {children}
  </Text>
);

const DropdownMenuSeparator = ({ style }: any) => (
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
  itemInset: {
    paddingLeft: 32,
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  labelInset: {
    paddingLeft: 32,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};