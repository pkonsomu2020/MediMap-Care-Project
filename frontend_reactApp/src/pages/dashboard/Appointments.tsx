import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Video, 
  X, 
  Check, 
  Edit,
  ChevronLeft
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { api } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Appointment = {
  appointment_id: number;
  user_id: number;
  clinic_id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'undefined';
  clinics: {
    clinic_id: number;
    name: string;
    address?: string;
    contact?: string;
  };
};

type TabType = 'upcoming' | 'past' | 'cancelled';

// Define your navigation param types
type RootStackParamList = {
  Reviews: { clinicId: number };
  FindClinics: undefined;
  Login: undefined;
  // Add other screens as needed
};

type AppointmentsNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const navigation = useNavigation<AppointmentsNavigationProp>();
  const [rescheduleModal, setRescheduleModal] = useState<{ visible: boolean; appointment: Appointment | null }>({ 
    visible: false, 
    appointment: null 
  });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  const loadAppointments = async () => {
    try {
      setError(null);
      const data = await api.listAppointments();
      console.log(data)
      setAppointments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load appointments";
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError("Please log in to view your appointments");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.updateAppointment(appointmentId, { status: 'cancelled' });
              setAppointments(prev =>
                prev.map(apt =>
                  apt.appointment_id === appointmentId
                    ? { ...apt, status: 'cancelled' as const }
                    : apt
                )
              );
              Alert.alert("Success", "Your appointment has been cancelled successfully.");
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Failed to cancel appointment";
              Alert.alert("Error", errorMessage);
            }
          }
        },
      ]
    );
  };

  const handleCompleteAppointment = async (appointmentId: number) => {
    try {
      await api.updateAppointment(appointmentId, { status: 'completed' });
      setAppointments(prev =>
        prev.map(apt =>
          apt.appointment_id === appointmentId
            ? { ...apt, status: 'completed' as const }
            : apt
        )
      );
      Alert.alert("Success", "Your appointment has been marked as completed.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete appointment";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleModal.appointment || !rescheduleData.date || !rescheduleData.time) return;

    try {
      await api.updateAppointment(rescheduleModal.appointment.appointment_id, {
        date: rescheduleData.date,
        time: rescheduleData.time
      });
      setAppointments(prev =>
        prev.map(apt =>
          apt.appointment_id === rescheduleModal.appointment!.appointment_id
            ? { ...apt, date: rescheduleData.date, time: rescheduleData.time }
            : apt
        )
      );
      setRescheduleModal({ visible: false, appointment: null });
      setRescheduleData({ date: '', time: '' });
      Alert.alert("Success", "Your appointment has been rescheduled successfully.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reschedule appointment";
      Alert.alert("Error", errorMessage);
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    setRescheduleModal({ visible: true, appointment });
    setRescheduleData({ date: appointment.date, time: appointment.time });
  };

  const getStatusBadge = (status: string) => {
    let backgroundColor, color, text;
    
    switch (status) {
      case "confirmed":
        backgroundColor = "#10B981";
        color = "white";
        text = "Confirmed";
        break;
      case "completed":
        backgroundColor = "#6B7280";
        color = "white";
        text = "Completed";
        break;
      case "cancelled":
        backgroundColor = "#EF4444";
        color = "white";
        text = "Cancelled";
        break;
      default:
        backgroundColor = "transparent";
        color = "#6B7280";
        text = status;
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
      </View>
    );
  };

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View>
          <Text style={styles.clinicName}>{appointment.clinics.name}</Text>
          <Text style={styles.appointmentId}>
            Appointment #{appointment.appointment_id}
          </Text>
        </View>
        {getStatusBadge(appointment.status)}
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#3B82F6" />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#3B82F6" />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#3B82F6" />
          <Text style={styles.detailText}>
            {appointment.clinics.address || 'Address not available'}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {(appointment.status === "confirmed" || appointment.status === "pending") && (
          <>
            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => openRescheduleModal(appointment)}
            >
              <Edit size={16} color="#3B82F6" />
              <Text style={styles.outlineButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => handleCancelAppointment(appointment.appointment_id)}
            >
              <X size={16} color="#EF4444" />
              <Text style={styles.ghostButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => handleCompleteAppointment(appointment.appointment_id)}
            >
              <Check size={16} color="#3B82F6" />
              <Text style={styles.outlineButtonText}>Complete</Text>
            </TouchableOpacity>
          </>
        )}
      {appointment.status === "completed" && (
          <TouchableOpacity 
            style={styles.outlineButton}
            onPress={() => navigation.navigate("Reviews", { clinicId: appointment.clinic_id })}
          >
            <Text style={styles.outlineButtonText}>Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const TabButton = ({ value, label, count }: { value: TabType; label: string; count: number }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.activeTab]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.tabButtonText, activeTab === value && styles.activeTabText]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    const isAuthError = error.includes("Please log in");
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {isAuthError ? (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={loadAppointments}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  const getCurrentAppointments = () => {
    switch (activeTab) {
      case 'upcoming': return upcomingAppointments;
      case 'past': return pastAppointments;
      case 'cancelled': return cancelledAppointments;
      default: return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'upcoming': return "No upcoming appointments";
      case 'past': return "No past appointments";
      case 'cancelled': return "No cancelled appointments";
      default: return "No appointments";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <Text style={styles.headerSubtitle}>Manage your healthcare appointments</Text>
        </View>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate("FindClinics" as never)}
        >
          <Calendar size={16} color="white" />
          <Text style={styles.primaryButtonText}>Book New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton value="upcoming" label="Upcoming" count={upcomingAppointments.length} />
        <TabButton value="past" label="Past" count={pastAppointments.length} />
        <TabButton value="cancelled" label="Cancelled" count={cancelledAppointments.length} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {getCurrentAppointments().length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
          </View>
        ) : (
          getCurrentAppointments().map((appointment) => (
            <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
          ))
        )}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRescheduleModal({ visible: false, appointment: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <Text style={styles.modalDescription}>
              Update the date and time for your appointment with {rescheduleModal.appointment?.clinics.name}.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={rescheduleData.date}
                onChangeText={(text) => setRescheduleData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={rescheduleData.time}
                onChangeText={(text) => setRescheduleData(prev => ({ ...prev, time: text }))}
                placeholder="HH:MM"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.outlineButton}
                onPress={() => setRescheduleModal({ visible: false, appointment: null })}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleRescheduleAppointment}
              >
                <Text style={styles.primaryButtonText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  appointmentId: {
    fontSize: 14,
    color: "#6B7280",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#374151",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  outlineButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
    fontSize: 14,
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  ghostButtonText: {
    color: "#EF4444",
    fontWeight: "500",
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
});