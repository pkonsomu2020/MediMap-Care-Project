import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { api } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";

type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  services?: string;
  consultation_fee?: number;
  contact?: string;
  rating?: number;
};

const Directory: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listClinics();
      setClinics(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load clinics";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listClinics({ q: searchQuery });
      setClinics(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search clinics";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? "star" : "star-outline"}
          size={16}
          color={i <= Math.floor(rating) ? "#FFD700" : "#CCC"}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderClinic = ({ item }: { item: Clinic }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="location-outline" size={40} color="#007AFF" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.clinicName}>{item.name}</Text>
          {item.rating && (
            <View style={styles.ratingRow}>
              {renderStars(item.rating)}
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      {item.address && (
        <View style={styles.infoRow}>
          <Ionicons name="map-outline" size={16} color="#007AFF" />
          <Text style={styles.infoText}>{item.address}</Text>
        </View>
      )}
      {item.contact && (
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#007AFF" />
          <Text style={styles.infoText}>{item.contact}</Text>
        </View>
      )}
      {item.consultation_fee && (
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#007AFF" />
          <Text style={styles.infoText}>
            ${item.consultation_fee} consultation fee
          </Text>
        </View>
      )}

      {item.services && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Services:</Text>
          <Text style={styles.infoText}>{item.services}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Book Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.outlineButton]}>
          <Text style={styles.outlineButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.ghostButton]}>
          <Text style={styles.ghostButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clinic Directory</Text>
      <Text style={styles.subtitle}>Browse all verified healthcare facilities</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clinics by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* States */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 8 }}>Loading clinics...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadClinics}>
            <Text style={{ color: "white" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item.clinic_id.toString()}
          renderItem={renderClinic}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
              No clinics found
            </Text>
          }
        />
      )}
    </View>
  );
};

export default Directory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 6,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  infoText: {
    marginLeft: 6,
    color: "#555",
    flexShrink: 1,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  primaryButtonText: { color: "white", fontWeight: "600" },
  outlineButtonText: { color: "#007AFF", fontWeight: "600" },
  ghostButtonText: { color: "#007AFF" },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
