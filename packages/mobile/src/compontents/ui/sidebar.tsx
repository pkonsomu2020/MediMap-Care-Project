// sidebar.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  Modal, 
  ScrollView, 
  Dimensions,
  Animated 
} from 'react-native';
import { PanelLeft } from 'lucide-react-native';

// Hooks (you'll need to create these)
const useIsMobile = () => {
  const { width } = Dimensions.get('window');
  return width < 768;
};

// Constants
const SIDEBAR_WIDTH = 256;
const SIDEBAR_WIDTH_MOBILE = 288;
const SIDEBAR_WIDTH_ICON = 48;

type SidebarContextType = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
}) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [_open, _setOpen] = useState(defaultOpen);
  
  const open = openProp ?? _open;
  
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === 'function' ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }
  };

  const toggleSidebar = () => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  };

  const state = open ? 'expanded' : 'collapsed';

  const contextValue: SidebarContextType = {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

interface SidebarProps {
  children: ReactNode;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  style?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  style,
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <View style={[{ width: SIDEBAR_WIDTH, backgroundColor: '#f8fafc' }, style]}>
        {children}
      </View>
    );
  }

  if (isMobile) {
    return (
      <Modal
        visible={openMobile}
        animationType="slide"
        onRequestClose={() => setOpenMobile(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#f8fafc', width: SIDEBAR_WIDTH_MOBILE }}>
          {children}
        </View>
      </Modal>
    );
  }

  return (
    <Animated.View
      style={[
        {
          width: state === 'collapsed' && collapsible === 'icon' ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH,
          backgroundColor: '#f8fafc',
          borderRightWidth: side === 'left' ? 1 : 0,
          borderLeftWidth: side === 'right' ? 1 : 0,
          borderColor: '#e2e8f0',
        },
        variant === 'floating' && {
          margin: 8,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SidebarTriggerProps {
  onPress?: () => void;
  style?: any;
}

export const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ onPress, style }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <TouchableOpacity
      onPress={() => {
        onPress?.();
        toggleSidebar();
      }}
      style={[
        {
          width: 28,
          height: 28,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
        },
        style,
      ]}
    >
      <PanelLeft size={16} />
    </TouchableOpacity>
  );
};

export const SidebarInset: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={[{ flex: 1, backgroundColor: 'white' }, style]}>
    {children}
  </View>
);

export const SidebarInput: React.FC<any> = (props) => {
  // You'll need to create an Input component or use TextInput
  return (
    <View style={{ height: 32, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, padding: 8 }}>
      <Text>Input Component</Text>
    </View>
  );
};

export const SidebarHeader: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={[{ padding: 8 }, style]}>{children}</View>
);

export const SidebarFooter: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={[{ padding: 8 }, style]}>{children}</View>
);

export const SidebarSeparator: React.FC<{ style?: any }> = ({ style }) => (
  <View style={[{ height: 1, backgroundColor: '#e2e8f0', marginHorizontal: 8 }, style]} />
);

export const SidebarContent: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <ScrollView style={[{ flex: 1 }, style]}>{children}</ScrollView>
);

export const SidebarGroup: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={[{ padding: 8 }, style]}>{children}</View>
);

export const SidebarGroupLabel: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <Text style={[{ fontSize: 12, fontWeight: '600', color: '#6b7280', padding: 8 }, style]}>
    {children}
  </Text>
);

export const SidebarMenu: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={[{ gap: 4 }, style]}>{children}</View>
);

export const SidebarMenuItem: React.FC<{ children: ReactNode; style?: any }> = ({ 
  children, 
  style 
}) => (
  <View style={style}>{children}</View>
);

interface SidebarMenuButtonProps {
  children: ReactNode;
  onPress?: () => void;
  isActive?: boolean;
  style?: any;
}

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({
  children,
  onPress,
  isActive = false,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 4,
        backgroundColor: isActive ? '#e2e8f0' : 'transparent',
      },
      style,
    ]}
  >
    <Text style={{ fontSize: 14, color: isActive ? '#1f2937' : '#6b7280' }}>
      {children}
    </Text>
  </TouchableOpacity>
);

// Export other sidebar components with basic implementations
export const SidebarRail = View;
export const SidebarGroupAction = TouchableOpacity;
export const SidebarGroupContent = View;
export const SidebarMenuAction = TouchableOpacity;
export const SidebarMenuBadge = View;
export const SidebarMenuSkeleton = View;
export const SidebarMenuSub = View;
export const SidebarMenuSubItem = View;
export const SidebarMenuSubButton = TouchableOpacity;