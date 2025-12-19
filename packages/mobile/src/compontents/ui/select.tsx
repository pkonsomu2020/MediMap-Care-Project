// select.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              onOpen: () => setIsOpen(true),
              onClose: () => setIsOpen(false),
              value,
              onValueChange,
            })
          : child
      )}
    </View>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpen?: () => void;
  style?: any;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, isOpen, onOpen, style }) => (
  <TouchableOpacity
    onPress={onOpen}
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'white',
      },
      style,
    ]}
  >
    <Text style={{ fontSize: 14 }}>{children}</Text>
    <ChevronDown size={16} color="#6b7280" />
  </TouchableOpacity>
);

interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  style?: any;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, isOpen, onClose, style }) => (
  <Modal visible={isOpen || false} transparent animationType="fade">
    <TouchableOpacity style={{ flex: 1 }} onPress={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
    </TouchableOpacity>
    <View
      style={[
        {
          position: 'absolute',
          top: '30%',
          left: 20,
          right: 20,
          maxHeight: 200,
          backgroundColor: 'white',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        style,
      ]}
    >
      <ScrollView>{children}</ScrollView>
    </View>
  </Modal>
);

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  onPress?: (value: string) => void;
  selectedValue?: string;
  style?: any;
}

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, onPress, selectedValue, style }) => (
  <TouchableOpacity
    onPress={() => onPress?.(value)}
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      },
      style,
    ]}
  >
    {selectedValue === value && <Check size={16} style={{ position: 'absolute', left: 8 }} />}
    <Text style={{ fontSize: 14 }}>{children}</Text>
  </TouchableOpacity>
);

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
  value?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ children, placeholder, value }) => (
  <Text style={{ fontSize: 14 }}>{value || children || placeholder}</Text>
);

export const SelectGroup = View;
export const SelectLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 14, fontWeight: '600', paddingHorizontal: 32, paddingVertical: 8 }}>{children}</Text>
);