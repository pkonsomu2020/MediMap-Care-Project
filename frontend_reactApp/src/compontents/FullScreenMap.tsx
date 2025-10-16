// components/FullScreenMap.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Navigation, X } from "lucide-react-native";
import { Clinic } from "./types/clinic.types";

interface FullScreenMapProps {
  visible: boolean;
  onClose: () => void;
  clinics: Clinic[];
  userLocation: any;
  selectedClinicForMap: Clinic | null;
  onClinicSelect: (clinic: Clinic | null) => void;
  onGetLocation: () => void;
  gettingLocation: boolean;
}

const FullScreenMap: React.FC<FullScreenMapProps> = ({
  visible,
  onClose,
  clinics,
  userLocation,
  selectedClinicForMap,
  onClinicSelect,
  onGetLocation,
  gettingLocation,
}) => {
  const mapRef = useRef<MapView>(null);
  const clinicsWithCoords = clinics.filter(clinic => 
    clinic.latitude && clinic.longitude &&
    typeof clinic.latitude === 'number' && 
    typeof clinic.longitude === 'number'
  );

  useEffect(() => {
    if (selectedClinicForMap && selectedClinicForMap.latitude && selectedClinicForMap.longitude) {
      mapRef.current?.animateToRegion({
        latitude: selectedClinicForMap.latitude,
        longitude: selectedClinicForMap.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [selectedClinicForMap]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
    >
      <View style={styles.fullMapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>
            Clinics Map - {clinicsWithCoords.length} clinics found
            {selectedClinicForMap && ` - Viewing: ${selectedClinicForMap.name}`}
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <MapView
          ref={mapRef}
          style={styles.fullMap}
          region={userLocation}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="#2563eb"
          />
          
          {clinicsWithCoords.map((clinic) => (
            <Marker
              key={clinic.clinic_id}
              coordinate={{
                latitude: clinic.latitude!,
                longitude: clinic.longitude!,
              }}
              title={clinic.name}
              description={clinic.address}
              pinColor={selectedClinicForMap?.clinic_id === clinic.clinic_id ? "#10b981" : "#ef4444"}
              onPress={() => {
                onClinicSelect(clinic);
                mapRef.current?.animateToRegion({
                  latitude: clinic.latitude!,
                  longitude: clinic.longitude!,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 1000);
              }}
            />
          ))}
        </MapView>
        
        <TouchableOpacity 
          style={styles.floatingLocationButton}
          onPress={onGetLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Navigation size={20} color="#2563eb" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.floatingLocationButton, { bottom: 80 }]}
          onPress={() => {
            onClinicSelect(null);
            mapRef.current?.animateToRegion(userLocation, 1000);
          }}
        >
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullMapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20, // Reduced from 60 to 20 for less top padding
    backgroundColor: 'white',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
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

export default FullScreenMap;