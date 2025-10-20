// components/ClinicCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, Star, Clock, Phone } from "lucide-react-native";
import { styles } from "../styles/FindClinics.styles";
import { Clinic } from "./types/clinic.types";

interface ClinicCardProps {
  clinic: Clinic;
  onMapPress: () => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onMapPress }) => {
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

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <TouchableOpacity 
          style={styles.iconBox}
          onPress={onMapPress}
        >
          <MapPin size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <View style={styles.row}>
                <MapPin size={14} color="#6b7280" />
                <Text style={styles.smallText}>
                  {clinic.address ?? "Address not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof clinic.rating === "number"
                  ? `${clinic.rating.toFixed(1)} ★`
                  : "No rating"}
              </Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            {renderStars(clinic.rating)}
            <Text style={[styles.smallText, { marginLeft: 8 }]}>
              {clinic.rating ? clinic.rating.toFixed(1) : "N/A"}
            </Text>

            <Clock size={14} color="#6b7280" style={{ marginLeft: 16 }} />
            <Text style={[styles.smallText, { marginLeft: 6 }]}>
              Consultation:{" "}
              {typeof clinic.consultation_fee === "number"
                ? `$${clinic.consultation_fee}`
                : "N/A"}
            </Text>
          </View>

          {clinic.services ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Services:</Text>
              <Text style={styles.smallText}>{clinic.services}</Text>
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
};

export default ClinicCard;