import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { Search, MapPin, Star, Clock, Phone } from "lucide-react-native";
import { api } from "../../lib/api";
import { styles } from "../../styles/FindClinics.styles";

type Clinic = {
  clinic_id: number;
  name: string;
  address?: string;
  rating?: number;
  contact?: string;
  consultation_fee?: number;
  services?: string;
};

const PAGE_SIZE = 20;

const FindClinics: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadClinics(1, searchQuery, false);
  }, []);

  const loadClinics = async (pageNumber: number, q = "", append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      // fetch all clinics for now (later we’ll request a limit/offset)
      const allClinics = await api.listClinics({ q: q || undefined });

      // simulate pagination client-side
      const start = (pageNumber - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const newPageData = allClinics.slice(start, end);

      setClinics((prev) =>
        append ? [...prev, ...newPageData] : newPageData
      );
      setHasMore(newPageData.length === PAGE_SIZE);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load clinics");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = useCallback(() => {
    loadClinics(1, searchQuery, false);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadClinics(page + 1, searchQuery, true);
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          color={i <= Math.floor(rating) ? "#f59e0b" : "#cbd5e1"}
          style={{ marginRight: 4 }}
        />
      );
    }
    return <View style={styles.starRow}>{stars}</View>;
  };

  const renderClinic = ({ item }: { item: Clinic }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <MapPin size={26} color="#fff" />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clinicName}>{item.name}</Text>
              <View style={styles.row}>
                <MapPin size={14} color="#6b7280" />
                <Text style={styles.smallText}>
                  {item.address ?? "Address not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof item.rating === "number"
                  ? `${item.rating.toFixed(1)} ★`
                  : "No rating"}
              </Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            {renderStars(item.rating)}
            <Text style={[styles.smallText, { marginLeft: 8 }]}>
              {item.rating ? item.rating.toFixed(1) : "N/A"}
            </Text>

            <Clock size={14} color="#6b7280" style={{ marginLeft: 16 }} />
            <Text style={[styles.smallText, { marginLeft: 6 }]}>
              Consultation:{" "}
              {typeof item.consultation_fee === "number"
                ? `$${item.consultation_fee}`
                : "N/A"}
            </Text>
          </View>

          {item.services ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Services:</Text>
              <Text style={styles.smallText}>{item.services}</Text>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Book Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.outlineButton]}>
              <Text style={styles.outlineButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.ghostButton]}>
              <Phone size={14} color="#2563eb" />
              <Text style={styles.ghostButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading && clinics.length === 0) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Clinics Near You</Text>
        <Text style={styles.subtitle}>
          Discover verified healthcare facilities in your area
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Clinic name or service"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadClinics(1, searchQuery, false)}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(c) => c.clinic_id.toString()}
          renderItem={renderClinic}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

export default FindClinics;

// your styles stay the same
