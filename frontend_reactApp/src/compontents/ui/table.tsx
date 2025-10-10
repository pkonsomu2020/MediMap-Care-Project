// table.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';

interface TableProps {
  children: React.ReactNode;
  style?: any;
}

export const Table: React.FC<TableProps> = ({ children, style }) => (
  <ScrollView horizontal style={style}>
    <View style={{ minWidth: '100%' }}>{children}</View>
  </ScrollView>
);

interface TableHeaderProps {
  children: React.ReactNode;
  style?: any;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, style }) => (
  <View style={[{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }, style]}>
    {children}
  </View>
);

interface TableBodyProps {
  children: React.ReactNode;
  style?: any;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, style }) => (
  <View style={style}>{children}</View>
);

interface TableRowProps {
  children: React.ReactNode;
  style?: any;
}

export const TableRow: React.FC<TableRowProps> = ({ children, style }) => (
  <View 
    style={[
      { 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#f3f4f6' 
      }, 
      style
    ]}
  >
    {children}
  </View>
);

interface TableHeadProps {
  children: React.ReactNode;
  style?: any;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, style }) => (
  <View 
    style={[
      { 
        flex: 1, 
        padding: 16, 
        justifyContent: 'center' 
      }, 
      style
    ]}
  >
    <Text style={{ fontWeight: '600', color: '#6b7280' }}>{children}</Text>
  </View>
);

interface TableCellProps {
  children: React.ReactNode;
  style?: any;
}

export const TableCell: React.FC<TableCellProps> = ({ children, style }) => (
  <View style={[{ flex: 1, padding: 16, justifyContent: 'center' }, style]}>
    <Text>{children}</Text>
  </View>
);

interface TableFooterProps {
  children: React.ReactNode;
  style?: any;
}

export const TableFooter: React.FC<TableFooterProps> = ({ children, style }) => (
  <View 
    style={[
      { 
        borderTopWidth: 1, 
        borderTopColor: '#e2e8f0', 
        backgroundColor: '#f9fafb' 
      }, 
      style
    ]}
  >
    {children}
  </View>
);

interface TableCaptionProps {
  children: React.ReactNode;
  style?: any;
}

export const TableCaption: React.FC<TableCaptionProps> = ({ children, style }) => (
  <Text style={[{ marginTop: 16, fontSize: 14, color: '#6b7280', textAlign: 'center' }, style]}>
    {children}
  </Text>
);