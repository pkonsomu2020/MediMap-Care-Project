import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Search, MapPin, Star, Clock, Phone, Filter, X, Navigation } from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
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
  latitude?: number;
  longitude?: number;
};

const PAGE_SIZE = 20;
const { width, height } = Dimensions.get('window');

const FindClinics: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Map states
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: -1.2921, // Nairobi, Kenya latitude
    longitude: 36.8219, // Nairobi, Kenya longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userAddress, setUserAddress] = useState<string>("");
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadClinics(1, searchQuery, false);
    requestLocationPermission();
  }, []);

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
      
      // Check if permission is granted
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

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Update map region to user's location
      setUserLocation({
        latitude,
        longitude,
        latitudeDelta: 0.05, // Zoom in a bit more for better detail
        longitudeDelta: 0.05,
      });

      // Reverse geocode to get address
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
          setSearchQuery(addressParts || ''); // Set searchQuery to the formatted address string
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError);
        setUserAddress('Location acquired - address not available');
      }

      // Show success message
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
              <Phone size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Mini Map Component
  const MiniMap = () => {
    // Filter clinics that have valid coordinates
    const clinicsWithCoords = clinics.filter(clinic => 
      clinic.latitude && clinic.longitude &&
      typeof clinic.latitude === 'number' && 
      typeof clinic.longitude === 'number'
    ).slice(0, 5); // Only show first 5 on mini map

    return (
      <TouchableOpacity 
        style={localStyles.mapContainer}
        onPress={() => setShowMapModal(true)}
      >
        <MapView
          style={localStyles.miniMap}
          region={userLocation}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* User location marker */}
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="#2563eb"
          />
          
          {/* Map through clinics with valid coordinates */}
          {clinicsWithCoords.map((clinic) => (
            <Marker
              key={clinic.clinic_id}
              coordinate={{
                latitude: clinic.latitude!,
                longitude: clinic.longitude!,
              }}
              title={clinic.name}
              pinColor="#ef4444" // Red color for clinics
            />
          ))}
        </MapView>
        <View style={localStyles.mapOverlay}>
          <Text style={localStyles.mapOverlayText}>
            {clinicsWithCoords.length > 0 
              ? `Tap to view ${clinicsWithCoords.length} clinics on map` 
              : 'Tap to view full map'
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Filters Sidebar Component
  const FiltersSidebar = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={localStyles.filtersContainer}>
        <View style={localStyles.filtersHeader}>
          <Text style={localStyles.filtersTitle}>Search & Filters</Text>
          <TouchableOpacity 
            onPress={() => setShowFilters(false)}
            style={localStyles.closeButton}
          >
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={localStyles.filtersContent}>
          {/* Location */}
          <View style={localStyles.filterSection}>
            <Text style={localStyles.filterLabel}>Location</Text>
            <View style={localStyles.inputContainer}>
              <MapPin size={20} color="#6b7280" style={localStyles.inputIcon} />
              <TextInput
                placeholder="Enter your location"
                style={localStyles.input}
                value={userAddress}
                onChangeText={setUserAddress}
                editable={false}
              />
            </View>
            <TouchableOpacity 
              style={[
                localStyles.locationButton,
                gettingLocation && localStyles.locationButtonDisabled
              ]}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Navigation size={16} color="#2563eb" />
              )}
              <Text style={localStyles.locationButtonText}>
                {gettingLocation ? 'Getting Location...' : 'Use My Location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={localStyles.filterSection}>
            <Text style={localStyles.filterLabel}>Search</Text>
            <View style={localStyles.inputContainer}>
              <Search size={20} color="#6b7280" style={localStyles.inputIcon} />
              <TextInput
                placeholder="Clinic name or service"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={localStyles.input}
              />
            </View>
          </View>

          {/* Specialty */}
          <View style={localStyles.filterSection}>
            <Text style={localStyles.filterLabel}>Specialty</Text>
            <View style={localStyles.filterOptions}>
              {["All Specialties", "General Practice", "Pediatrics", "Cardiology", "Dermatology", "Orthopedics"].map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    localStyles.filterOption,
                    selectedSpecialty === specialty.toLowerCase().replace(' ', '-') && localStyles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedSpecialty(specialty.toLowerCase().replace(' ', '-'))}
                >
                  <Text style={[
                    localStyles.filterOptionText,
                    selectedSpecialty === specialty.toLowerCase().replace(' ', '-') && localStyles.filterOptionTextSelected
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={localStyles.filterSection}>
            <Text style={localStyles.filterLabel}>Availability</Text>
            <View style={localStyles.filterOptions}>
              {["Any Time", "Available Today", "This Week"].map((availability) => (
                <TouchableOpacity
                  key={availability}
                  style={localStyles.filterOption}
                >
                  <Text style={localStyles.filterOptionText}>{availability}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance */}
          <View style={localStyles.filterSection}>
            <Text style={localStyles.filterLabel}>Max Distance</Text>
            <View style={localStyles.filterOptions}>
              {["Within 5 km", "Within 10 km", "Within 20 km", "Within 50 km"].map((distance) => (
                <TouchableOpacity
                  key={distance}
                  style={localStyles.filterOption}
                >
                  <Text style={localStyles.filterOptionText}>{distance}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={localStyles.filtersFooter}>
          <TouchableOpacity 
            style={localStyles.applyButton}
            onPress={() => {
              setShowFilters(false);
              handleSearch();
            }}
          >
            <Text style={localStyles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Full Screen Map Modal
  const FullScreenMap = () => {
    // Filter clinics that have valid coordinates
    const clinicsWithCoords = clinics.filter(clinic => 
      clinic.latitude && clinic.longitude &&
      typeof clinic.latitude === 'number' && 
      typeof clinic.longitude === 'number'
    );

    return (
      <Modal
        visible={showMapModal}
        animationType="slide"
      >
        <View style={localStyles.fullMapContainer}>
          <View style={localStyles.mapHeader}>
            <Text style={localStyles.mapTitle}>
              Clinics Map - {clinicsWithCoords.length} clinics found
            </Text>
            <TouchableOpacity 
              onPress={() => setShowMapModal(false)}
              style={localStyles.closeButton}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <MapView
            style={localStyles.fullMap}
            region={userLocation}
            showsUserLocation={true}
          >
            {/* User location marker */}
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your Location"
              pinColor="#2563eb"
            />
            
            {/* Map through all clinics with valid coordinates */}
            {clinicsWithCoords.map((clinic) => (
              <Marker
                key={clinic.clinic_id}
                coordinate={{
                  latitude: clinic.latitude!,
                  longitude: clinic.longitude!,
                }}
                title={clinic.name}
                description={clinic.address}
                pinColor="#ef4444" // Red color for clinics
              />
            ))}
          </MapView>
          
          {/* Location button on full map */}
          <TouchableOpacity 
            style={localStyles.floatingLocationButton}
            onPress={getCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Navigation size={20} color="#2563eb" />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    );
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
        <MiniMap />

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
              <View key={clinic.clinic_id.toString()}>
                {renderClinic({ item: clinic })}
              </View>
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
        <FiltersSidebar />
        <FullScreenMap />
      </View>
    </ScrollView>
  );
};

// Local styles for the new components
const localStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 120,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  miniMap: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlayText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  filtersContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  filtersContent: {
    flex: 1,
    padding: 16,
  },
  filtersFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  filterOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterOptionText: {
    color: '#374151',
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fullMapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  fullMap: {
    flex: 1,
  },
  floatingLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default FindClinics;