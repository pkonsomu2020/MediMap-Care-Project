// command.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Keyboard,
} from 'react-native';
import { Search } from 'lucide-react-native';

interface CommandProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}

interface CommandDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface CommandItemProps {
  onSelect?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: any;
}

const CommandContext = React.createContext<{
  selected: number;
  setSelected: (index: number) => void;
  search: string;
  setSearch: (search: string) => void;
}>({
  selected: 0,
  setSelected: () => {},
  search: '',
  setSearch: () => {},
});

const Command = ({ children, style }: CommandProps) => {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState('');

  return (
    <CommandContext.Provider value={{ selected, setSelected, search, setSearch }}>
      <View style={[styles.command, style]}>{children}</View>
    </CommandContext.Provider>
  );
};

const CommandDialog = ({ open, onOpenChange, children }: CommandDialogProps) => {
  return (
    <Modal
      visible={!!open}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange?.(false)}
    >
      <View style={styles.dialogContainer}>
        {children}
      </View>
    </Modal>
  );
};

const CommandInput = ({ placeholder, style, ...props }: any) => {
  const { search, setSearch } = React.useContext(CommandContext);
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <View style={[styles.inputContainer, style]}>
      <Search size={20} color="#6b7280" style={styles.searchIcon} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder || "Type a command or search..."}
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );
};

const CommandList = ({ children, style }: any) => {
  return (
    <View style={[styles.list, style]}>
      {children}
    </View>
  );
};

const CommandEmpty = ({ children, style }: any) => {
  return (
    <View style={[styles.empty, style]}>
      <Text style={styles.emptyText}>{children || "No results found."}</Text>
    </View>
  );
};

const CommandGroup = ({ children, style, heading }: any) => {
  return (
    <View style={[styles.group, style]}>
      {heading && (
        <Text style={styles.groupHeading}>{heading}</Text>
      )}
      {children}
    </View>
  );
};

const CommandItem = ({ onSelect, children, disabled, style }: CommandItemProps) => {
  const { selected, setSelected } = React.useContext(CommandContext);
  const itemRef = useRef<TouchableOpacity>(null);

  return (
    <TouchableOpacity
      ref={itemRef}
      style={[
        styles.item,
        selected === React.Children.count(children) && styles.itemSelected,
        disabled && styles.itemDisabled,
        style,
      ]}
      onPress={onSelect}
      disabled={disabled}
    >
      <Text style={[
        styles.itemText,
        disabled && styles.itemTextDisabled,
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const CommandSeparator = ({ style }: any) => {
  return <View style={[styles.separator, style]} />;
};

const styles = StyleSheet.create({
  command: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dialogContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  group: {
    paddingVertical: 8,
  },
  groupHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemSelected: {
    backgroundColor: '#f3f4f6',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 16,
    color: '#374151',
  },
  itemTextDisabled: {
    color: '#9ca3af',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
});

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};