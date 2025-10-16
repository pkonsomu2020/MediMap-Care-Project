import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {Feather} from "@expo/vector-icons";

type Step = {
    icon: React.ComponentProps<typeof Feather>['name'],
    title: string,
    description: string,
    step: string
  };

const steps: Step[] = [
  {
    icon: "search",
    title: "Search for Clinics",
    description:
      "Use your location or search manually to find verified clinics near you. Filter by specialty, ratings, and distance.",
    step: "01",
  },
  {
    icon: "calendar",
    title: "Book Appointment",
    description:
      "Choose your preferred time slot from available options. Get instant confirmation via email and SMS.",
    step: "02",
  },
  {
    icon: "check-circle",
    title: "Get Quality Care",
    description:
      "Visit the clinic at your scheduled time. After your visit, share your experience to help others.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Simple Process</Text>
        </View>
        <Text style={styles.title}>
          How MediMap Care{"\n"}
          <Text style={styles.gradientText}>Works For You</Text>
        </Text>
        <Text style={styles.subtitle}>
          Getting quality healthcare has never been easier. Just three simple
          steps to better health.
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            {/* Step Number */}
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.step}</Text>
            </View>

            {/* Icon */}
            <View style={styles.iconWrapper}>
              <Feather name={step.icon} size={32} color="#fff" />
            </View>

            {/* Content */}
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  badge: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderColor: "rgba(59,130,246,0.2)",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  badgeText: {
    color: "#3B82F6",
    fontWeight: "500",
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  gradientText: {
    color: "#10B981",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    maxWidth: 300,
  },
  stepsContainer: {
    flexDirection: "column",
    gap: 24,
  },
  stepCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepNumber: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "bold",
  },
  iconWrapper: {
    backgroundColor: "#10B981",
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  stepDescription: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HowItWorks;
