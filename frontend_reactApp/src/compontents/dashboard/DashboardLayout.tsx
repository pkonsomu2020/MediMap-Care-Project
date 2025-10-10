import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  MapPin,
  Calendar,
  Map,
  Star,
  User,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { api } from "../../lib/api";

type UserType = {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

const navItems = [
  { name: "Find Clinics", route: "FindClinics", icon: Map },
  { name: "My Appointments", route: "Appointments", icon: Calendar },
  { name: "Clinic Directory", route: "Directory", icon: MapPin },
  { name: "Reviews", route: "Reviews", icon: Star },
  { name: "Profile", route: "Profile", icon: User },
];

export default function DashboardLayout() {
  const navigation = useNavigation();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await api.getCurrentUser();
        setUser(data);
      } catch (error: any) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem("token");
    Alert.alert("Signed out", "You have been signed out.", [
      { text: "OK", onPress: () => navigation.navigate("Login" as never) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={24} color="#111" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={22} color="#111" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate("Profile" as never)}
          >
            <Text style={styles.avatarText}>
              {user ? getInitials(user.name) : "?"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut} style={styles.logout}>
            <LogOut size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Replacement (Drawer content alternative) */}
      <ScrollView contentContainerStyle={styles.navList}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.navItem}
              onPress={() => navigation.navigate(item.route as never)}
            >
              <Icon size={20} color="#333" />
              <Text style={styles.navText}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  logout: {
    padding: 6,
  },
  navList: {
    paddingVertical: 16,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomColor: "#EEE",
    borderBottomWidth: 1,
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#111",
  },
  notificationDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
});
