// sheet.tsx
import React from 'react';
import { View, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sheet: React.FC<SheetProps> = ({ children, open, onOpenChange }) => (
  <View>
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, {
            visible: open,
            onClose: () => onOpenChange?.(false),
          })
        : child
    )}
  </View>
);

interface SheetTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const SheetTrigger: React.FC<SheetTriggerProps> = ({ children, onPress }) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

interface SheetContentProps {
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  side?: 'top' | 'bottom' | 'left' | 'right';
  style?: any;
}

export const SheetContent: React.FC<SheetContentProps> = ({ children, visible, onClose, side = 'right', style }) => {
  const getPositionStyle = () => {
    switch (side) {
      case 'top':
        return { top: 0, left: 0, right: 0 };
      case 'bottom':
        return { bottom: 0, left: 0, right: 0 };
      case 'left':
        return { top: 0, left: 0, bottom: 0 };
      case 'right':
        return { top: 0, right: 0, bottom: 0 };
      default:
        return { top: 0, right: 0, bottom: 0 };
    }
  };

  const getSizeStyle = () => {
    switch (side) {
      case 'top':
      case 'bottom':
        return { height: '50%' };
      case 'left':
      case 'right':
        return { width: '75%' };
      default:
        return { width: '75%' };
    }
  };

  return (
    <Modal visible={visible || false} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View
          style={[
            {
              position: 'absolute',
              backgroundColor: 'white',
              ...getPositionStyle(),
              ...getSizeStyle(),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            },
            style,
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          >
            <X size={16} />
          </TouchableOpacity>
          <ScrollView style={{ flex: 1, padding: 24 }}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface SheetHeaderProps {
  children: React.ReactNode;
  style?: any;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ children, style }) => (
  <View style={[{ marginBottom: 16 }, style]}>{children}</View>
);

interface SheetTitleProps {
  children: React.ReactNode;
  style?: any;
}

export const SheetTitle: React.FC<SheetTitleProps> = ({ children, style }) => (
  <Text style={[{ fontSize: 18, fontWeight: '600' }, style]}>{children}</Text>
);

interface SheetDescriptionProps {
  children: React.ReactNode;
  style?: any;
}

export const SheetDescription: React.FC<SheetDescriptionProps> = ({ children, style }) => (
  <Text style={[{ fontSize: 14, color: '#6b7280', marginTop: 4 }, style]}>{children}</Text>
);

export const SheetClose = TouchableOpacity;