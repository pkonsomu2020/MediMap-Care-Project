// toggle.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ToggleProps {
  pressed?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  pressed,
  onPress,
  children,
  style,
  variant = 'default',
  size = 'default',
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: 10 };
      case 'lg':
        return { height: 44, paddingHorizontal: 20 };
      default:
        return { height: 40, paddingHorizontal: 12 };
    }
  };

  const getVariantStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: pressed ? '#f3f4f6' : 'transparent',
      };
    }
    return {
      backgroundColor: pressed ? '#f3f4f6' : 'transparent',
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
          ...getSizeStyle(),
          ...getVariantStyle(),
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 14, fontWeight: '500' }}>{children}</Text>
    </TouchableOpacity>
  );
};