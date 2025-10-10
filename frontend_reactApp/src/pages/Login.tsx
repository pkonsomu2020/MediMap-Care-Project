import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MapPin, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { api, setAuthToken } from "../lib/api"; // adjust path as needed

const Login = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const { token } = await api.login({ email, password });
      setAuthToken(token);
      navigation.navigate("FindClinics" as never);
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Please try again");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top side */}
      <LinearGradient
        colors={["#2563eb", "#3b82f6"]}
        style={styles.rightContainer}
      >
        <View style={styles.heroCircle}>
          <MapPin color="#fff" size={64} />
        </View>
        <Text style={styles.heroTitle}>Find Care Near You</Text>
        <Text style={styles.heroSubtitle}>
          Access quality healthcare anytime, anywhere with MediMap Care
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Verified Clinics</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>10K+</Text>
            <Text style={styles.statLabel}>Happy Patients</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Side - Form */}
      <View style={styles.formContainer}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate("Landing" as never)}
        >
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>MediMap Care</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to access your healthcare dashboard
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Mail color="#888" size={20} style={styles.icon} />
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Lock color="#888" size={20} style={styles.icon} />
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            {showPassword ? (
              <EyeOff color="#888" size={20} />
            ) : (
              <Eye color="#888" size={20} />
            )}
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => navigation.navigate("Signup" as never)}
          >
            Sign up for free
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  iconRight: {
    position: "absolute",
    right: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    color: "#2563eb",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 16,
  },
  signupLink: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  rightContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  heroCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#f0f9ff",
    textAlign: "center",
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    color: "#e0f2fe",
  },
});

export default Login;

