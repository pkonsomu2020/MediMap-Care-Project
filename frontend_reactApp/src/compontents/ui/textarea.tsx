// textarea.tsx
import React from 'react';
import { TextInput, View } from 'react-native';

interface TextareaProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  style?: any;
  numberOfLines?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChangeText,
  placeholder,
  style,
  numberOfLines = 4,
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    multiline
    numberOfLines={numberOfLines}
    style={[
      {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        textAlignVertical: 'top',
        minHeight: 80,
      },
      style,
    ]}
  />
);