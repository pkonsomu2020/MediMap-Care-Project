import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl, // Add this import
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Star, ThumbsUp, ChevronLeft } from "lucide-react-native";
import { api } from "../../lib/api";

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

// Define the route params type
type ReviewsRouteParams = {
  clinicId?: string;
};

// Define the route prop type
type ReviewsRouteProp = RouteProp<{ Reviews: ReviewsRouteParams }, 'Reviews'>;

export default function Reviews() {
  const navigation = useNavigation();
  const route = useRoute<ReviewsRouteProp>();
  const clinicIdParam = route.params?.clinicId;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(
    clinicIdParam ? parseInt(clinicIdParam) : null
  );
  const [newReview, setNewReview] = useState({
    clinic_id: clinicIdParam || "",
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    loadClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      loadReviews(selectedClinicId);
    }
  }, [selectedClinicId]);

  const loadClinics = async () => {
    try {
      const data = await api.listClinics();
      setClinics(data);
      if (!selectedClinicId && data.length > 0) {
        setSelectedClinicId(data[0].clinic_id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load clinics";
      setError(errorMessage);
    }
  };

  const loadReviews = async (clinicId: number) => {
    try {
      setError(null);
      const data = await api.listReviewsByClinic(clinicId);
      setReviews(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load reviews";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedClinicId) {
      loadReviews(selectedClinicId);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.clinic_id || newReview.rating === 0) {
      Alert.alert("Error", "Please select a clinic and provide a rating");
      return;
    }

    try {
      await api.createReview({
        clinic_id: parseInt(newReview.clinic_id),
        rating: newReview.rating,
        comment: newReview.comment || undefined,
      });
      setNewReview({ clinic_id: "", rating: 0, comment: "" });
      // Reload reviews for the selected clinic
      if (selectedClinicId) {
        loadReviews(selectedClinicId);
      }
      Alert.alert("Success", "Review submitted successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit review";
      Alert.alert("Error", errorMessage);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onPress?: (rating: number) => void) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <TouchableOpacity
        key={i}
        disabled={!interactive}
        onPress={() => onPress?.(i + 1)}
      >
        <Star
          size={size}
          color={i < rating ? "#F59E0B" : "#D1D5DB"}
          fill={i < rating ? "#F59E0B" : "transparent"}
        />
      </TouchableOpacity>
    ));
  };

  const getClinicName = (clinicId: number) => {
    const clinic = clinics.find(c => c.clinic_id === clinicId);
    return clinic?.name || `Clinic #${clinicId}`;
  };

  const ReviewCard = ({ review, index }: { review: Review; index: number }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U{review.user_id}</Text>
        </View>
        
        <View style={styles.reviewInfo}>
          <View style={styles.reviewTitle}>
            <Text style={styles.userName}>User #{review.user_id}</Text>
            <Text style={styles.date}>
              {new Date(review.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.clinicName}>
            {getClinicName(review.clinic_id)}
          </Text>
        </View>
      </View>

      <View style={styles.starsContainer}>
        {renderStars(review.rating)}
      </View>

      {review.comment && (
        <Text style={styles.comment}>{review.comment}</Text>
      )}

      <TouchableOpacity style={styles.helpfulButton}>
        <ThumbsUp size={16} color="#6B7280" />
        <Text style={styles.helpfulText}>Helpful</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reviews</Text>
          <Text style={styles.headerSubtitle}>
            Share your experience and read others' feedback
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.grid}>
          {/* Write Review */}
          <View style={styles.writeReviewContainer}>
            <View style={styles.writeReviewCard}>
              <Text style={styles.sectionTitle}>Write a Review</Text>
              
              {/* Clinic Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Clinic</Text>
                <ScrollView style={styles.clinicSelector}>
                  {clinics.map((clinic) => (
                    <TouchableOpacity
                      key={clinic.clinic_id}
                      style={[
                        styles.clinicOption,
                        newReview.clinic_id === clinic.clinic_id.toString() && styles.clinicOptionSelected
                      ]}
                      onPress={() => setNewReview(prev => ({ 
                        ...prev, 
                        clinic_id: clinic.clinic_id.toString() 
                      }))}
                    >
                      <Text style={[
                        styles.clinicOptionText,
                        newReview.clinic_id === clinic.clinic_id.toString() && styles.clinicOptionTextSelected
                      ]}>
                        {clinic.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Rating */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rating</Text>
                <View style={styles.starsInput}>
                  {renderStars(newReview.rating, 24, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </View>
              </View>

              {/* Comment */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Review</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Share your experience with the clinic..."
                  value={newReview.comment}
                  onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsContainer}>
            {/* Clinic Selector */}
            <View style={styles.clinicSelectorCard}>
              <Text style={styles.label}>Select Clinic to View Reviews</Text>
              <ScrollView horizontal style={styles.clinicSelectorHorizontal}>
                {clinics.map((clinic) => (
                  <TouchableOpacity
                    key={clinic.clinic_id}
                    style={[
                      styles.clinicTab,
                      selectedClinicId === clinic.clinic_id && styles.clinicTabSelected
                    ]}
                    onPress={() => setSelectedClinicId(clinic.clinic_id)}
                  >
                    <Text style={[
                      styles.clinicTabText,
                      selectedClinicId === clinic.clinic_id && styles.clinicTabTextSelected
                    ]}>
                      {clinic.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            )}

            {/* Error State */}
            {error && !loading && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => selectedClinicId && loadReviews(selectedClinicId)}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Reviews */}
            {!loading && !error && (
              <>
                {reviews.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No reviews yet for this clinic</Text>
                  </View>
                ) : (
                  reviews.map((review, index) => (
                    <ReviewCard key={review.review_id} review={review} index={index} />
                  ))
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  grid: {
    padding: 16,
  },
  writeReviewContainer: {
    marginBottom: 16,
  },
  writeReviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  clinicSelector: {
    maxHeight: 120,
  },
  clinicOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  clinicOptionSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  clinicOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  clinicOptionTextSelected: {
    color: "white",
    fontWeight: "500",
  },
  starsInput: {
    flexDirection: "row",
    gap: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewsContainer: {
    flex: 1,
  },
  clinicSelectorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clinicSelectorHorizontal: {
    marginTop: 8,
  },
  clinicTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
  },
  clinicTabSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  clinicTabText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  clinicTabTextSelected: {
    color: "white",
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  clinicName: {
    fontSize: 14,
    color: "#6B7280",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  comment: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  helpfulButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  helpfulText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6B7280",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});