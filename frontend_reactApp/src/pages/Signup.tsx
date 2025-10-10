// src/pages/Signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { api, setAuthToken } from "../lib/api";

const Signup: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"patient" | "clinic">("patient");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const role = userType === "clinic" ? "clinic" : "user";
      const { token } = await api.register({
        ...formData,
        role,
      });
      setAuthToken(token);
      Toast.show({ type: "success", text1: "Signup successful!" });
      navigation.navigate("FindClinics");
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <MapPin size={64} color="#3B82F6" />
            <Text style={styles.title}>Join MediMap Care</Text>
            <Text style={styles.subtitle}>Start your journey to better healthcare</Text>
          </View>

          {/* Radio Switch */}
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                userType === "patient" && styles.radioOptionSelected,
              ]}
              onPress={() => setUserType("patient")}
            >
              <User color={userType === "patient" ? "#fff" : "#3B82F6"} />
              <Text
                style={[
                  styles.radioText,
                  userType === "patient" && styles.radioTextSelected,
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                userType === "clinic" && styles.radioOptionSelected,
              ]}
              onPress={() => setUserType("clinic")}
            >
              <MapPin color={userType === "clinic" ? "#fff" : "#3B82F6"} />
              <Text
                style={[
                  styles.radioText,
                  userType === "clinic" && styles.radioTextSelected,
                ]}
              >
                Clinic
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <View style={styles.inputGroup}>
            <User style={styles.icon} color="#6B7280" />
            <TextInput
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(v) => handleChange("name", v)}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Mail style={styles.icon} color="#6B7280" />
            <TextInput
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone style={styles.icon} color="#6B7280" />
            <TextInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(v) => handleChange("phone", v)}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock style={styles.icon} color="#6B7280" />
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(v) => handleChange("password", v)}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? <EyeOff color="#6B7280" /> : <Eye color="#6B7280" />}
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Login link */}
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Login")}
            >
              Sign in
            </Text>
          </Text>

          <Toast />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 12,
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioOption: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioOptionSelected: {
    backgroundColor: "#3B82F6",
  },
  radioText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  radioTextSelected: {
    color: "#fff",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingLeft: 8,
  },
  icon: {
    marginRight: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
  link: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});