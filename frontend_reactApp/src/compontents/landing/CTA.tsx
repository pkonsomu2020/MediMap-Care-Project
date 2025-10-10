import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function CTA() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo and Heading */}
      <View style={styles.heroBox}>
        <View style={styles.logoCircle}>
          <Image
            source={require("../../assets/logo.png")} // update this path
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          Ready to Find Your Healthcare Provider?
        </Text>

        <Text style={styles.subtitle}>
          Join thousands of users who have simplified their healthcare journey
          with MediMap Care. Start booking appointments today!
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Signup" as never)}
          >
            <Text style={styles.primaryText}>Get Started Free</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("FindClinics" as never)}
          >
            <Text style={styles.secondaryText}>Explore Clinics</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Verified Clinics</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Happy Patients</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  heroBox: {
    width: width * 0.9,
    backgroundColor: "#0284C7",
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "90%",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    paddingTop: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
});
