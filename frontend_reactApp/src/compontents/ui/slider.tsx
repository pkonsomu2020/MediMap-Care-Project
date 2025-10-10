// slider.tsx
import React, { useState } from 'react';
import { View, PanResponder, Animated } from 'react-native';

interface SliderProps {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: any;
}

export const Slider: React.FC<SliderProps> = ({
  value = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const position = new Animated.Value(((value - min) / (max - min)) * (sliderWidth - 20));

  const handleMove = (gestureState: any) => {
    const newValue = Math.max(min, Math.min(max, value + (gestureState.dx / sliderWidth) * (max - min)));
    const steppedValue = Math.round(newValue / step) * step;
    onValueChange?.(steppedValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      handleMove(gestureState);
    },
  });

  return (
    <View
      style={[{ height: 40, justifyContent: 'center' }, style]}
      onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
    >
      <View
        style={{
          height: 8,
          backgroundColor: '#e5e7eb',
          borderRadius: 4,
          marginHorizontal: 10,
        }}
      >
        <View
          style={{
            height: 8,
            backgroundColor: '#3b82f6',
            borderRadius: 4,
            width: `${((value - min) / (max - min)) * 100}%`,
          }}
        />
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          left: position,
          width: 20,
          height: 20,
          backgroundColor: 'white',
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#3b82f6',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </View>
  );
};