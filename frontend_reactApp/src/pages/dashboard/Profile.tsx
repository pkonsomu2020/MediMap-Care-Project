import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { AlertTriangle, UserX, RefreshCw } from "lucide-react-native";
import { api } from "../../lib/api";

type User = {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await api.getCurrentUser();
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
      });
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      setUser(prev => (prev ? { ...prev, ...formData } : null));
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();

  // --- States ---
  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.stateText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <AlertTriangle color="#EF4444" size={48} />
        <Text style={[styles.stateText, { color: "#EF4444" }]}>{error}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadUserProfile}>
          <RefreshCw color="#fff" size={18} />
          <Text style={styles.reloadText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerState}>
        <UserX color="#9CA3AF" size={48} />
        <Text style={styles.stateText}>No user data found</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadUserProfile}>
          <RefreshCw color="#fff" size={18} />
          <Text style={styles.reloadText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Main Content ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6f7" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your personal information</Text>
        </View>

        <View style={styles.card}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.muted}>Patient ID: #{user.user_id}</Text>
              <Text style={styles.email}>{user.email}</Text>
              {user.phone && <Text style={styles.email}>{user.phone}</Text>}
            </View>
          </View>

          {/* Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <TextInput
              style={[styles.input, !isEditing && styles.disabled]}
              editable={isEditing}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
            />

            <TextInput
              style={[styles.input, !isEditing && styles.disabled]}
              editable={isEditing}
              placeholder="Email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
            />

            <TextInput
              style={[styles.input, !isEditing && styles.disabled]}
              editable={isEditing}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
            />
          </View>

          {/* Medical Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <TextInput style={styles.input} placeholder="Blood Type (N/A)" editable={false} />
            <TextInput style={styles.input} placeholder="Allergies (None)" editable={false} />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Medical Conditions"
              editable={false}
              multiline
            />
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TextInput style={styles.input} placeholder="Name" editable={false} />
            <TextInput style={styles.input} placeholder="Relationship" editable={false} />
            <TextInput style={styles.input} placeholder="Phone Number" editable={false} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                  <Text style={styles.primaryText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineButton} onPress={handleCancel}>
                  <Text style={styles.outlineText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.outlineButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.outlineText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f6f7",
    padding: 16,
    flexGrow: 1,
    marginTop: 20, // ✅ Start below navbar
  },

  // --- Center States ---
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f5f6f7",
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  reloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  reloadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // --- Header ---
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#666",
  },

  // --- Card ---
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  // --- Avatar ---
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
  },
  muted: {
    color: "#888",
    marginBottom: 4,
  },
  email: {
    color: "#333",
  },

  // --- Sections ---
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
  },

  // --- Actions ---
  actions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
});
