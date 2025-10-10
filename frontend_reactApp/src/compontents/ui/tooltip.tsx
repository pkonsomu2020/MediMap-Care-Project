// tooltip.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  style?: any;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, style }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={style}>
      <TouchableOpacity onPress={() => setVisible(!visible)}>
        {children}
      </TouchableOpacity>
      {visible && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            padding: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 50,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 12 }}>{content}</Text>
        </View>
      )}
    </View>
  );
};

export const TooltipTrigger = TouchableOpacity;
export const TooltipContent = View;
export const TooltipProvider = View;