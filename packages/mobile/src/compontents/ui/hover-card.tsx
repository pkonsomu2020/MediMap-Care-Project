// hover-card.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface HoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
}

const HoverCard = ({ children, content, delay = 300 }: HoverCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handlePressOut = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={delay}
      >
        {children}
      </TouchableOpacity>
      
      {isVisible && (
        <View style={styles.content}>
          {content}
        </View>
      )}
    </View>
  );
};

const HoverCardTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const HoverCardContent = ({ children, style }: any) => {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: 256,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
  },
});

export { HoverCard, HoverCardTrigger, HoverCardContent };