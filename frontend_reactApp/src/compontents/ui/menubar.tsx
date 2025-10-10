// menubar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import { Check, ChevronRight, Circle } from 'lucide-react-native';

interface MenubarProps {
  children: React.ReactNode;
  style?: any;
}

export const Menubar: React.FC<MenubarProps> = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', height: 40, borderRadius: 6, borderWidth: 1, backgroundColor: 'white', padding: 4 }, style]}>
    {children}
  </View>
);

interface MenubarTriggerProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}

export const MenubarTrigger: React.FC<MenubarTriggerProps> = ({ children, onPress, style }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
      },
      style,
    ]}
  >
    <Text style={{ fontSize: 14, fontWeight: '500' }}>{children}</Text>
  </TouchableOpacity>
);

interface MenubarContentProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  style?: any;
}

export const MenubarContent: React.FC<MenubarContentProps> = ({ children, visible, onClose, style }) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={{ flex: 1 }} onPress={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
    </TouchableOpacity>
    <View
      style={[
        {
          position: 'absolute',
          top: 50,
          left: 20,
          minWidth: 200,
          backgroundColor: 'white',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        style,
      ]}
    >
      {children}
    </View>
  </Modal>
);

interface MenubarItemProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  inset?: boolean;
}

export const MenubarItem: React.FC<MenubarItemProps> = ({ children, onPress, style, inset }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
      },
      inset && { paddingLeft: 32 },
      style,
    ]}
  >
    <Text style={{ fontSize: 14 }}>{children}</Text>
  </TouchableOpacity>
);

interface MenubarSeparatorProps {
  style?: any;
}

export const MenubarSeparator: React.FC<MenubarSeparatorProps> = ({ style }) => (
  <View style={[{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }, style]} />
);

// Export other components with basic implementations
export const MenubarMenu = View;
export const MenubarGroup = View;
export const MenubarLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 14, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 6 }}>{children}</Text>
);

export const MenubarShortcut: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>{children}</Text>
);