// drawer.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DrawerContentProps {
  children: React.ReactNode;
  style?: any;
}

const DrawerContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

const Drawer = ({ open, onOpenChange, children }: DrawerProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <DrawerContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

const DrawerTrigger = ({ children, asChild }: any) => {
  const { setOpen } = React.useContext(DrawerContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: () => setOpen(true),
    } as any);
  }

  return (
    <TouchableOpacity onPress={() => setOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

const DrawerContent = ({ children, style }: DrawerContentProps) => {
  const { open, setOpen } = React.useContext(DrawerContext);
  const panY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [contentHeight, setContentHeight] = React.useState(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        panY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > contentHeight * 0.3 || gestureState.vy > 0.5) {
        closeDrawer();
      } else {
        resetPosition();
      }
    },
  });

  const resetPosition = () => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(panY, {
      toValue: Dimensions.get('window').height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  React.useEffect(() => {
    if (open) {
      panY.setValue(Dimensions.get('window').height);
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
      }).start();
    }
  }, [open]);

  if (!open) return null;

  return (
    <Modal transparent visible={open} animationType="none">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={closeDrawer}
      >
        <Animated.View
          style={[
            styles.content,
            style,
            { transform: [{ translateY: panY }] },
          ]}
          onLayout={(event) => {
            setContentHeight(event.nativeEvent.layout.height);
          }}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const DrawerHeader = ({ style, children }: any) => (
  <View style={[styles.header, style]}>{children}</View>
);

const DrawerFooter = ({ style, children }: any) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const DrawerTitle = ({ style, children }: any) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const DrawerDescription = ({ style, children }: any) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34, // Safe area for bottom
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    marginTop: 'auto',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};