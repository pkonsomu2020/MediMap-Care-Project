// FindClinics.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Search, Filter } from "lucide-react-native";
import * as Location from 'expo-location';
import { api } from "../../lib/api";
import { styles } from "../../styles/FindClinics.styles";
import MiniMap from "../../compontents/MiniMap";
import FiltersSidebar from "../../compontents/FiltersSidebar";
import FullScreenMap from "../../compontents/FullScreenMap";
import ClinicCard from "../../compontents/ClinicCard";
import { Clinic } from "../../compontents/types/clinic.types";

const PAGE_SIZE = 20;

const FindClinics: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedClinicForMap, setSelectedClinicForMap] = useState<Clinic | null>(null);
  
  // Map states
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userAddress, setUserAddress] = useState<string>("");
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadClinics(1, searchQuery, false);
    requestLocationPermission();
  }, []);

  // Find clinic on map
  const handleClinicMapSelect = (clinic: Clinic) => {
    if (clinic.latitude && clinic.longitude) {
      setSelectedClinicForMap(clinic);
      setShowMapModal(true);
      
      setUserLocation({
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert(
        'Location Not Available',
        'This clinic does not have location data available.',
        [{ text: 'OK' }]
      );
    }
  };

  // Request location permission on app start
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location permission is required to use this feature. Please enable location permissions in your device settings.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      setUserLocation({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          const addressParts = [
            address.street,
            address.city,
            address.region,
            address.country,
          ].filter(part => part).join(', ');

          setUserAddress(addressParts || 'Address not available');
          setSearchQuery(addressParts || '');
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError);
        setUserAddress('Location acquired - address not available');
      }

      Alert.alert(
        'Location Found',
        'Your current location has been set successfully. Use advanced search to find hospitals and clinics near you',
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const loadClinics = async (pageNumber: number, q = "", append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const allClinics = await api.listClinics({ q: q || undefined });
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

  if (loading && clinics.length === 0) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={localStyles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Find Clinics Near You</Text>
          <Text style={styles.subtitle}>
            Discover verified healthcare facilities in your area
          </Text>
        </View>

        {/* Mini Map Section */}
        <MiniMap
          clinics={clinics}
          userLocation={userLocation}
          selectedClinicForMap={selectedClinicForMap}
          onMapPress={() => {
            setSelectedClinicForMap(null);
            setShowMapModal(true);
          }}
        />

        {/* Search Section */}
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

        {/* Advanced Search Button */}
        <TouchableOpacity 
          style={localStyles.advancedSearchButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={16} color="#2563eb" />
          <Text style={localStyles.advancedSearchText}>Advanced Search</Text>
        </TouchableOpacity>

        {/* Clinics List */}
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
          <View style={localStyles.clinicsListContainer}>
            {clinics.map((clinic) => (
              <ClinicCard
                key={clinic.clinic_id.toString()}
                clinic={clinic}
                onMapPress={() => handleClinicMapSelect(clinic)}
              />
            ))}
            {loadingMore && (
              <ActivityIndicator size="small" color="#2563eb" style={localStyles.loadingMore} />
            )}
            {!loadingMore && hasMore && clinics.length > 0 && (
              <TouchableOpacity 
                style={localStyles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={localStyles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Modals */}
        <FiltersSidebar
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          userAddress={userAddress}
          gettingLocation={gettingLocation}
          onGetLocation={getCurrentLocation}
          selectedSpecialty={selectedSpecialty}
          onSpecialtyChange={setSelectedSpecialty}
          onApplyFilters={handleSearch}
        />
        
        <FullScreenMap
          visible={showMapModal}
          onClose={() => {
            setShowMapModal(false);
            setSelectedClinicForMap(null);
          }}
          clinics={clinics}
          userLocation={userLocation}
          selectedClinicForMap={selectedClinicForMap}
          onClinicSelect={setSelectedClinicForMap}
          onGetLocation={getCurrentLocation}
          gettingLocation={gettingLocation}
        />
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  advancedSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  advancedSearchText: {
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
  },
  clinicsListContainer: {
    marginBottom: 40,
  },
  loadingMore: {
    marginVertical: 16,
  },
  loadMoreButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FindClinics;