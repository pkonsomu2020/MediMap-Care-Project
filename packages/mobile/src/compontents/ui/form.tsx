// form.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form';

// Form context remains largely the same since it's logic-based
const Form = FormProvider;

const useFormField = () => {
  const { getFieldState, formState } = useFormContext();
  
  return {
    getFieldState,
    formState,
  };
};

const FormItem = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[{ marginBottom: 16 }, style]}
        {...props}
      />
    );
  }
);

const FormLabel = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ style, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        style={[{ fontSize: 14, fontWeight: '500', marginBottom: 4 }, style]}
        {...props}
      />
    );
  }
);

const FormControl = React.forwardRef<TextInput, React.ComponentProps<typeof TextInput>>(
  ({ ...props }, ref) => {
    return <TextInput ref={ref} {...props} />;
  }
);

const FormDescription = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ style, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        style={[{ fontSize: 12, color: '#6b7280', marginTop: 4 }, style]}
        {...props}
      />
    );
  }
);

const FormMessage = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ style, children, ...props }, ref) => {
    const { formState } = useFormField();
    
    if (!children && !formState.errors) {
      return null;
    }

    return (
      <Text
        ref={ref}
        style={[{ fontSize: 12, color: '#ef4444', marginTop: 4 }, style]}
        {...props}
      >
        {children || 'This field is required'}
      </Text>
    );
  }
);

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Controller as FormField,
};