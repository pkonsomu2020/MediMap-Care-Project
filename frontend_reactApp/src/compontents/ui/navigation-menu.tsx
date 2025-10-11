// navigation-menu.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface NavigationMenuProps {
  children: React.ReactNode;
  style?: any;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
    {children}
  </View>
);

interface NavigationMenuListProps {
  children: React.ReactNode;
  style?: any;
}

export const NavigationMenuList: React.FC<NavigationMenuListProps> = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
    {children}
  </View>
);

interface NavigationMenuItemProps {
  children: React.ReactNode;
  style?: any;
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({ children, style }) => (
  <View style={style}>{children}</View>
);

interface NavigationMenuTriggerProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}

export const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({ children, onPress, style }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: 'white',
      },
      style,
    ]}
  >
    <Text style={{ fontSize: 14, fontWeight: '500' }}>{children}</Text>
    <ChevronDown size={12} style={{ marginLeft: 4 }} />
  </TouchableOpacity>
);

interface NavigationMenuContentProps {
  children: React.ReactNode;
  visible: boolean;
  style?: any;
}

export const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({ children, visible, style }) => {
  if (!visible) return null;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          padding: 8,
          marginTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
          zIndex: 50,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const NavigationMenuLink: React.FC<{ children: React.ReactNode; onPress?: () => void }> = ({
  children,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={{ fontSize: 14, paddingVertical: 8 }}>{children}</Text>
  </TouchableOpacity>
);