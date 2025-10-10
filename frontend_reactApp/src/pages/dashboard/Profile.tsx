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
} from "react-native";
import Icon from "lucide-react-native";
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

  useEffect(() => {
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load profile";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      // You could call: await api.updateUser(formData);
      setUser(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)}>
          <Text style={styles.buttonOutline}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No user data found</Text>
        <TouchableOpacity onPress={() => setError(null)}>
          <Text style={styles.buttonOutline}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Manage your personal information</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
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
              <TouchableOpacity style={styles.buttonOutline} onPress={handleCancel}>
                <Text style={styles.outlineText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.buttonOutline} onPress={() => setIsEditing(true)}>
              <Text style={styles.outlineText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f6f7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
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
  buttonOutline: {
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
  error: {
    color: "red",
    marginBottom: 10,
  },
});
