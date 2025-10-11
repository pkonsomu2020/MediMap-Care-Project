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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { AlertTriangle, UserX, RefreshCw, Calendar } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";
import DateTimePicker from '@react-native-community/datetimepicker';

type User = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  date_of_birth?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  medical_conditions?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    // Medical Information
    blood_type: "",
    allergies: "",
    medical_conditions: "",
    // Emergency Contact
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
  });

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await api.getCurrentUser();

      setUser(userData);
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        date_of_birth: userData.date_of_birth || "",
        blood_type: userData.blood_type || "",
        allergies: userData.allergies || "",
        medical_conditions: userData.medical_conditions || "",
        emergency_contact_name: userData.emergency_contact_name || "",
        emergency_contact_relationship: userData.emergency_contact_relationship || "",
        emergency_contact_phone: userData.emergency_contact_phone || "",
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
      Keyboard.dismiss();
      await api.updateCurrentUser(formData)
      Alert.alert("Success", "Profile updated successfully");
    } catch {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email,
        phone: user.phone || "",
        date_of_birth: user.date_of_birth || "",
        blood_type: user.blood_type || "",
        allergies: user.allergies || "",
        medical_conditions: user.medical_conditions || "",
        emergency_contact_name: user.emergency_contact_name || "",
        emergency_contact_relationship: user.emergency_contact_relationship || "",
        emergency_contact_phone: user.emergency_contact_phone || "",
      });
    }
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData(prev => ({ ...prev, date_of_birth: formattedDate }));
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getFullName = (u: User) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ") || "Unnamed User";

  const getInitials = (u: User) => {
    const first = u.first_name?.[0] || "";
    const last = u.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  // Helper function to get placeholder text for editable fields
  const getPlaceholder = (field: string, defaultValue: string) => {
    return isEditing ? field : `${field}: ${defaultValue}`;
  };

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
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>My Profile</Text>
              <Text style={styles.subtitle}>Manage your personal information</Text>
            </View>

            <View style={styles.card}>
              {/* Avatar */}
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(user)}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.name}>{getFullName(user)}</Text>
                  <Text style={styles.muted}>ID: #{user.user_id}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                  {user.phone && <Text style={styles.email}>{user.phone}</Text>}
                  {formData.date_of_birth && (
                    <Text style={styles.email}>
                      {formatDisplayDate(formData.date_of_birth)} 
                      {` (${calculateAge(formData.date_of_birth)} years old)`}
                    </Text>
                  )}
                </View>
              </View>

              {/* Personal Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder="First Name"
                  value={formData.first_name}
                  onChangeText={text => setFormData(prev => ({ ...prev, first_name: text }))}
                  returnKeyType="next"
                />

                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChangeText={text => setFormData(prev => ({ ...prev, last_name: text }))}
                  returnKeyType="next"
                />

                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
                  returnKeyType="next"
                />

                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
                  returnKeyType="next"
                />

                {/* Date of Birth Field */}
                {isEditing ? (
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput, !isEditing && styles.disabled]}
                    onPress={showDatepicker}
                  >
                    <View style={styles.dateInputContent}>
                      <Text style={formData.date_of_birth ? styles.dateText : styles.placeholderText}>
                        {formData.date_of_birth ? formatDisplayDate(formData.date_of_birth) : "Date of Birth"}
                      </Text>
                      <Calendar size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TextInput
                    style={[styles.input, styles.disabled]}
                    editable={false}
                    placeholder={getPlaceholder("Date of Birth", user.date_of_birth ? formatDisplayDate(user.date_of_birth) : "Not provided")}
                  />
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date(1990, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Medical Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medical Information</Text>
                
                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder={getPlaceholder("Blood Type", user.blood_type || "Not provided")}
                  value={formData.blood_type}
                  onChangeText={text => setFormData(prev => ({ ...prev, blood_type: text }))}
                  returnKeyType="next"
                />
                
                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder={getPlaceholder("Allergies", user.allergies || "None")}
                  value={formData.allergies}
                  onChangeText={text => setFormData(prev => ({ ...prev, allergies: text }))}
                  returnKeyType="next"
                />
                
                <TextInput
                  style={[styles.input, !isEditing && styles.disabled, { height: 80 }]}
                  editable={isEditing}
                  placeholder={getPlaceholder("Medical Conditions", user.medical_conditions || "None")}
                  value={formData.medical_conditions}
                  onChangeText={text => setFormData(prev => ({ ...prev, medical_conditions: text }))}
                  multiline
                  textAlignVertical="top"
                  returnKeyType="next"
                />
              </View>

              {/* Emergency Contact */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                
                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder={getPlaceholder("Emergency Contact Name", user.emergency_contact_name || "Not provided")}
                  value={formData.emergency_contact_name}
                  onChangeText={text => setFormData(prev => ({ ...prev, emergency_contact_name: text }))}
                  returnKeyType="next"
                />
                
                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder={getPlaceholder("Relationship", user.emergency_contact_relationship || "Not provided")}
                  value={formData.emergency_contact_relationship}
                  onChangeText={text => setFormData(prev => ({ ...prev, emergency_contact_relationship: text }))}
                  returnKeyType="next"
                />
                
                <TextInput
                  style={[styles.input, !isEditing && styles.disabled]}
                  editable={isEditing}
                  placeholder={getPlaceholder("Emergency Contact Phone", user.emergency_contact_phone || "Not provided")}
                  value={formData.emergency_contact_phone}
                  onChangeText={text => setFormData(prev => ({ ...prev, emergency_contact_phone: text }))}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
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
            
            {/* Extra padding at bottom for better scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f6f7",
    padding: 16,
    flexGrow: 1,
    marginTop: 20,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f7",
    paddingHorizontal: 24,
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
    shadowOpacity: 0.08,
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
    fontSize: 14,
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
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateInputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#000',
  },
  placeholderText: {
    fontSize: 15,
    color: '#666',
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
  bottomPadding: {
    height: 100, // Extra space for keyboard
  },
});