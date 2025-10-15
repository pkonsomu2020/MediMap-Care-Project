import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { MapPin, Search, Calendar } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Hero() {
  const navigation = useNavigation();
  const [searchValue, setSearchValue] = useState("");
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={["#10b98120", "#3b82f620"]}
        style={styles.backgroundGradient}
      />

      {/* Left Content */}
      <View style={styles.textSection}>
        <View style={styles.badge}>
          <MapPin size={16} color="#2563EB" />
          <Text style={styles.badgeText}>Healthcare Made Simple</Text>
        </View>

        <Text style={styles.title}>
          Find Quality{"\n"}
          <Text style={styles.gradientText}>Healthcare Near You</Text>
        </Text>

        <Text style={styles.description}>
          Discover verified clinics in your area and book appointments
          instantly. Skip the queues, save time, and get the care you deserve —
          all in one simple platform.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Search size={18} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by location, clinic, or service..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={searchValue}
              onChangeText={setSearchValue}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={async () => {
              await AsyncStorage.setItem("searchValue", searchValue);
              navigation.navigate("FindClinics" as never);
            }}
          >
            <MapPin size={18} color="#fff" />
            <Text style={styles.searchButtonText}>Find Clinics</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatItem number="500+" label="Verified Clinics" color="#2563EB" />
          <StatItem number="10K+" label="Happy Patients" color="#16A34A" />
          <StatItem number="24/7" label="Support Available" color="#F59E0B" />
        </View>
      </View>

      {/* Right Content (Visual Card) */}
      <View style={styles.rightContent}>
        {/* Main Floating Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Calendar size={22} color="#2563EB" />
            </View>
            <Text style={styles.status}>Available</Text>
          </View>

          <Text style={styles.cardTitle}>City Care Clinic</Text>
          <Text style={styles.cardSubtitle}>General Practice • 2.5km away</Text>

          <View style={styles.cardFooter}>
            <View style={styles.avatarGroup}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.avatar} />
              ))}
              <Text style={styles.plusText}>+120</Text>
            </View>
            <TouchableOpacity style={styles.bookButton}
              onPress={() => navigation.navigate("Appointments" as never)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Badges */}
        <View style={styles.badgeTopRight}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeSmallText}>1,234 appointments today</Text>
        </View>

        <View style={styles.badgeBottomLeft}>
          <Text style={styles.star}>⭐</Text>
          <View>
            <Text style={styles.rating}>4.8/5</Text>
            <Text style={styles.ratingLabel}>Average Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* --- StatItem Subcomponent --- */
const StatItem = ({
  number,
  label,
  color,
}: {
  number: string;
  label: string;
  color: string;
}) => (
  <View style={styles.statItem}>
    <Text style={[styles.statNumber, { color }]}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* --- Styles --- */
const styles = StyleSheet.create({
  container: {
    flex: 0,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textSection: {
    marginTop: 0,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 20,
  },
  badgeText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 40,
    color: "#111827",
    marginBottom: 10,
  },
  gradientText: {
    color: "#2563EB",
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inputContainer: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 8,
    top: "35%",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    paddingLeft: 36,
    paddingRight: 10,
    color: "#111827",
  },
  searchButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  rightContent: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 80,
  },
  card: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    backgroundColor: "#DBEAFE",
    padding: 8,
    borderRadius: 10,
  },
  status: {
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#93C5FD",
    borderWidth: 2,
    borderColor: "#fff",
    marginLeft: -8,
  },
  plusText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#6B7280",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  badgeTopRight: {
    position: "absolute",
    top: 20,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 8,
  },
  badgeSmallText: {
    fontSize: 12,
    color: "#111827",
  },
  badgeBottomLeft: {
    position: "absolute",
    bottom: 30,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  star: {
    fontSize: 18,
    marginRight: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  ratingLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
});