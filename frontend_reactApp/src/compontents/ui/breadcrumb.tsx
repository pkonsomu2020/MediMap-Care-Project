import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  GestureResponderEvent,
} from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";

type BreadcrumbProps = {
  children: React.ReactNode;
  separator?: React.ReactNode;
  style?: object;
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  children,
  style,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={[styles.breadcrumb, style]}
  >
    {children}
  </ScrollView>
);

export const BreadcrumbList: React.FC<{ children: React.ReactNode; style?: object }> = ({
  children,
  style,
}) => <View style={[styles.list, style]}>{children}</View>;

export const BreadcrumbItem: React.FC<{ children: React.ReactNode; style?: object }> = ({
  children,
  style,
}) => <View style={[styles.item, style]}>{children}</View>;

export const BreadcrumbLink: React.FC<{
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: object;
}> = ({ onPress, children, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.link, style]}>{children}</Text>
  </TouchableOpacity>
);

export const BreadcrumbPage: React.FC<{
  children: React.ReactNode;
  style?: object;
}> = ({ children, style }) => (
  <Text style={[styles.page, style]}>{children}</Text>
);

export const BreadcrumbSeparator: React.FC<{
  children?: React.ReactNode;
  style?: object;
}> = ({ children, style }) => (
  <View style={[styles.separator, style]}>
    {children ?? <ChevronRight size={16} color="#6b7280" />}
  </View>
);

export const BreadcrumbEllipsis: React.FC<{ style?: object }> = ({
  style,
}) => (
  <View style={[styles.ellipsis, style]}>
    <MoreHorizontal size={18} color="#6b7280" />
  </View>
);

const styles = StyleSheet.create({
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  link: {
    color: "#2563eb",
    fontSize: 14,
  },
  page: {
    fontSize: 14,
    color: "#111",
  },
  separator: {
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  ellipsis: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
