// components/FiltersSidebar.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Search, MapPin, Navigation, X } from "lucide-react-native";

interface FiltersSidebarProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (text: string) => void;
  userAddress: string;
  gettingLocation: boolean;
  onGetLocation: () => void;
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
  onApplyFilters: () => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  visible,
  onClose,
  searchQuery,
  onSearchQueryChange,
  userAddress,
  gettingLocation,
  onGetLocation,
  selectedSpecialty,
  onSpecialtyChange,
  onApplyFilters,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.filtersContainer}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Search & Filters</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filtersContent}>
          {/* Location */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Location</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your location"
                style={styles.input}
                value={userAddress}
                editable={false}
              />
            </View>
            <TouchableOpacity 
              style={[
                styles.locationButton,
                gettingLocation && styles.locationButtonDisabled
              ]}
              onPress={onGetLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Navigation size={16} color="#2563eb" />
              )}
              <Text style={styles.locationButtonText}>
                {gettingLocation ? 'Getting Location...' : 'Use My Location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Search</Text>
            <View style={styles.inputContainer}>
              <Search size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Clinic name or service"
                value={searchQuery}
                onChangeText={onSearchQueryChange}
                style={styles.input}
              />
            </View>
          </View>

          {/* Specialty */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Specialty</Text>
            <View style={styles.filterOptions}>
              {["All Specialties", "General Practice", "Pediatrics", "Cardiology", "Dermatology", "Orthopedics"].map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.filterOption,
                    selectedSpecialty === specialty.toLowerCase().replace(' ', '-') && styles.filterOptionSelected
                  ]}
                  onPress={() => onSpecialtyChange(specialty.toLowerCase().replace(' ', '-'))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedSpecialty === specialty.toLowerCase().replace(' ', '-') && styles.filterOptionTextSelected
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Availability</Text>
            <View style={styles.filterOptions}>
              {["Any Time", "Available Today", "This Week"].map((availability) => (
                <TouchableOpacity
                  key={availability}
                  style={styles.filterOption}
                >
                  <Text style={styles.filterOptionText}>{availability}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Max Distance</Text>
            <View style={styles.filterOptions}>
              {["Within 5 km", "Within 10 km", "Within 20 km", "Within 50 km"].map((distance) => (
                <TouchableOpacity
                  key={distance}
                  style={styles.filterOption}
                >
                  <Text style={styles.filterOptionText}>{distance}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.filtersFooter}>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => {
              onClose();
              onApplyFilters();
            }}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default FiltersSidebar;