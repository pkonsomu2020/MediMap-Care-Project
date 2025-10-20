// components/MiniMap.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Clinic } from "./types/clinic.types";

interface MiniMapProps {
  clinics: Clinic[];
  userLocation: any;
  selectedClinicForMap: Clinic | null;
  onMapPress: () => void;
}

const MiniMap: React.FC<MiniMapProps> = ({
  clinics,
  userLocation,
  selectedClinicForMap,
  onMapPress,
}) => {
  const clinicsWithCoords = clinics.filter(clinic => 
    clinic.latitude && clinic.longitude &&
    typeof clinic.latitude === 'number' && 
    typeof clinic.longitude === 'number'
  ).slice(0, 5);

  return (
    <TouchableOpacity 
      style={styles.mapContainer}
      onPress={onMapPress}
    >
      <MapView
        style={styles.miniMap}
        region={userLocation}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
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
            pinColor={selectedClinicForMap?.clinic_id === clinic.clinic_id ? "#10b981" : "#ef4444"}
          />
        ))}
      </MapView>
      <View style={styles.mapOverlay}>
        <Text style={styles.mapOverlayText}>
          {clinicsWithCoords.length > 0 
            ? `Tap to view ${clinicsWithCoords.length} clinics on map` 
            : 'Tap to view full map'
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default MiniMap;