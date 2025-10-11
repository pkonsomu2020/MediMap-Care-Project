import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  MapPin,
  Calendar,
  Star,
  Shield,
  Clock,
  Heart,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const features = [
  {
    icon: MapPin,
    title: "Find Nearby Clinics",
    description:
      "Discover verified healthcare facilities in your area with real-time location tracking and interactive maps.",
    color: "#2563EB",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description:
      "Book appointments in seconds with real-time availability and instant confirmation notifications.",
    color: "#0EA5E9",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description:
      "Read authentic patient reviews and ratings to make informed healthcare decisions.",
    color: "#F59E0B",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your health data is protected with enterprise-grade security and HIPAA compliance.",
    color: "#3B82F6",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description:
      "Browse clinics and book appointments anytime, anywhere, from any device.",
    color: "#2563EB",
  },
  {
    icon: Heart,
    title: "Quality Care",
    description:
      "Access only verified healthcare providers committed to excellent patient care.",
    color: "#10B981",
  },
];

export default function Features() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Why Choose Us</Text>
        </View>

        <Text style={styles.title}>
          Everything You Need for{"\n"}
          <Text style={styles.gradientText}>Better Healthcare</Text>
        </Text>

        <Text style={styles.subtitle}>
          We've built the most comprehensive platform to connect you with
          quality healthcare providers in your area.
        </Text>
      </View>

      {/* Features Grid */}
      <View style={styles.gridContainer}>
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.title} style={styles.card}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Icon size={28} color={item.color} />
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.description}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  badge: {
    backgroundColor: "rgba(37,99,235,0.1)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  badgeText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  gradientText: {
    color: "#2563EB",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    maxWidth: width * 0.85,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    width: (width - 60) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  cardText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
});
