// tabs.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  style?: any;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  value,
  onValueChange,
  style,
}) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <View style={style}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              activeValue: activeTab,
              onValueChange: handleValueChange,
            })
          : child
      )}
    </View>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  style?: any;
}

export const TabsList: React.FC<TabsListProps> = ({ children, style }) => (
  <View 
    style={[
      { 
        flexDirection: 'row', 
        backgroundColor: '#f3f4f6', 
        borderRadius: 6, 
        padding: 4 
      }, 
      style
    ]}
  >
    {children}
  </View>
);

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  style?: any;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children,
  value,
  activeValue,
  onValueChange,
  style,
}) => (
  <TouchableOpacity
    onPress={() => onValueChange?.(value)}
    style={[
      {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: 'center',
        backgroundColor: activeValue === value ? 'white' : 'transparent',
      },
      style,
    ]}
  >
    <Text 
      style={{ 
        fontSize: 14, 
        fontWeight: '500',
        color: activeValue === value ? '#1f2937' : '#6b7280'
      }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  activeValue?: string;
  style?: any;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  children,
  value,
  activeValue,
  style,
}) => {
  if (activeValue !== value) return null;

  return <View style={[{ marginTop: 8 }, style]}>{children}</View>;
};