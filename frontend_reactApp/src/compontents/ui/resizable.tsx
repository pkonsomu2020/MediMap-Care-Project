// resizable.tsx
import React, { useState } from 'react';
import { View, PanResponder, Animated } from 'react-native';
import { GripVertical } from 'lucide-react-native';

interface ResizablePanelGroupProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  style?: any;
}

export const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({ 
  children, 
  direction = 'horizontal', 
  style 
}) => (
  <View 
    style={[
      { 
        flex: 1, 
        flexDirection: direction === 'vertical' ? 'column' : 'row' 
      }, 
      style
    ]}
  >
    {children}
  </View>
);

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  style?: any;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ 
  children, 
  defaultSize,
  minSize,
  maxSize,
  style 
}) => (
  <View style={[{ flex: defaultSize }, style]}>
    {children}
  </View>
);

interface ResizableHandleProps {
  withHandle?: boolean;
  onResize?: (delta: number) => void;
  style?: any;
}

export const ResizableHandle: React.FC<ResizableHandleProps> = ({ 
  withHandle = false, 
  onResize,
  style 
}) => {
  const [pan] = useState(new Animated.ValueXY());

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      onResize?.(gestureState.dx);
    },
  });

  return (
    <View
      style={[
        {
          width: 12,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      {withHandle && (
        <View
          style={{
            width: 12,
            height: 24,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#d1d5db',
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <GripVertical size={10} color="#6b7280" />
        </View>
      )}
    </View>
  );
};