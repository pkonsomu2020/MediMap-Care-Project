import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { api } from "../../lib/api"; // adjust path if needed
import { Star } from "lucide-react-native";

type Review = {
  review_id: number;
  user_id: number;
  clinic_id: number;
  rating: number;
  comment?: string;
  created_at: string;
};

type Clinic = {
  clinic_id: number;
  name: string;
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    clinic_id: "",
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const data = await api.listClinics();
        setClinics(data);
        if (data.length > 0) setSelectedClinicId(data[0].clinic_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clinics");
      }
    };
    loadClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) loadReviews(selectedClinicId);
  }, [selectedClinicId]);

  const loadReviews = async (clinicId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listReviewsByClinic(clinicId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.clinic_id || newReview.rating === 0) return;
    try {
      await api.createReview({
        clinic_id: parseInt(newReview.clinic_id),
        rating: newReview.rating,
        comment: newReview.comment || undefined,
      });
      setNewReview({ clinic_id: "", rating: 0, comment: "" });
      if (selectedClinicId) loadReviews(selectedClinicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <View style={styles.starRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            disabled={!interactive}
            onPress={() => interactive && onSelect && onSelect(i + 1)}
          >
            <Star
              size={24}
              color={i < rating ? "#facc15" : "#d1d5db"}
              fill={i < rating ? "#facc15" : "none"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getClinicName = (clinicId: number) => {
    const clinic = clinics.find((c) => c.clinic_id === clinicId);
    return clinic?.name || `Clinic #${clinicId}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reviews</Text>
        <Text style={styles.headerSubtitle}>
          Share your experience and read others' feedback
        </Text>
      </View>

      {/* Write Review Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Write a Review</Text>

        {/* Clinic Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Clinic</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {clinics.map((clinic) => (
              <TouchableOpacity
                key={clinic.clinic_id}
                style={[
                  styles.clinicButton,
                  newReview.clinic_id === clinic.clinic_id.toString() && styles.clinicButtonSelected,
                ]}
                onPress={() =>
                  setNewReview((prev) => ({ ...prev, clinic_id: clinic.clinic_id.toString() }))
                }
              >
                <Text
                  style={[
                    styles.clinicButtonText,
                    newReview.clinic_id === clinic.clinic_id.toString() && styles.clinicButtonTextActive,
                  ]}
                >
                  {clinic.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rating */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rating</Text>
          {renderStars(newReview.rating, true, (r) =>
            setNewReview((prev) => ({ ...prev, rating: r }))
          )}
        </View>

        {/* Comment */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Review</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share your experience..."
            multiline
            value={newReview.comment}
            onChangeText={(text) => setNewReview((prev) => ({ ...prev, comment: text }))}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmitReview}>
          <Text style={styles.buttonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>

      {/* Clinic Selector for Viewing */}
      <View style={styles.card}>
        <Text style={styles.label}>Select Clinic to View Reviews</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {clinics.map((clinic) => (
            <TouchableOpacity
              key={clinic.clinic_id}
              style={[
                styles.clinicButton,
                selectedClinicId === clinic.clinic_id && styles.clinicButtonSelected,
              ]}
              onPress={() => setSelectedClinicId(clinic.clinic_id)}
            >
              <Text
                style={[
                  styles.clinicButtonText,
                  selectedClinicId === clinic.clinic_id && styles.clinicButtonTextActive,
                ]}
              >
                {clinic.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* States */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>Loading reviews...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => selectedClinicId && loadReviews(selectedClinicId)}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && reviews.length === 0 && (
        <Text style={styles.noReviews}>No reviews yet for this clinic</Text>
      )}

      {/* Reviews */}
      {!loading &&
        !error &&
        reviews.map((review) => (
          <View key={review.review_id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.reviewUser}>User #{review.user_id}</Text>
                <Text style={styles.reviewClinic}>{getClinicName(review.clinic_id)}</Text>
              </View>
              <Text style={styles.reviewDate}>
                {new Date(review.created_at).toLocaleDateString()}
              </Text>
            </View>

            {renderStars(review.rating)}

            {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  headerSubtitle: { color: "#6b7280" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  label: { fontWeight: "500", marginBottom: 6 },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  starRow: { flexDirection: "row", gap: 6 },
  clinicButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginRight: 8,
  },
  clinicButtonSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  clinicButtonText: { color: "#374151" },
  clinicButtonTextActive: { color: "#fff" },
  centered: { alignItems: "center", marginVertical: 24 },
  errorText: { color: "#dc2626", marginBottom: 12 },
  noReviews: { textAlign: "center", color: "#6b7280", marginVertical: 24 },
  reviewCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewUser: { fontWeight: "600" },
  reviewClinic: { color: "#6b7280", fontSize: 12 },
  reviewDate: { color: "#9ca3af", fontSize: 12 },
  comment: { marginTop: 8, color: "#111827" },
});
