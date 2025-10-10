import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { api } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";

type Appointment = {
  appointment_id: number;
  user_id: number;
  clinic_id: number;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

const Appointments = ({ navigation }: any) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listAppointments();
      setAppointments(data);
    } catch (err: any) {
      const msg =
        err?.message || "Failed to load appointments. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const color =
      status === "confirmed"
        ? "#10b981"
        : status === "completed"
        ? "#6b7280"
        : status === "cancelled"
        ? "#ef4444"
        : "#d1d5db";
    return (
      <View style={[styles.badge, { backgroundColor: color + "33", borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{status}</Text>
      </View>
    );
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Clinic #{appointment.clinic_id}</Text>
          <Text style={styles.cardSubtitle}>
            Appointment #{appointment.appointment_id}
          </Text>
        </View>
        {getStatusBadge(appointment.status)}
      </View>

      <View style={styles.cardDetailRow}>
        <Ionicons name="calendar-outline" size={16} color="#2563eb" />
        <Text style={styles.cardDetailText}>{appointment.date}</Text>
      </View>

      <View style={styles.cardDetailRow}>
        <Ionicons name="time-outline" size={16} color="#2563eb" />
        <Text style={styles.cardDetailText}>{appointment.time}</Text>
      </View>

      <View style={styles.actionRow}>
        {appointment.status === "confirmed" && (
          <>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton}>
              <Ionicons
                name="close"
                size={14}
                color="#ef4444"
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.ghostText, { color: "#ef4444" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
        {appointment.status === "completed" && (
          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.outlineText}>Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filterAppointments = (status: string) => {
    if (status === "upcoming")
      return appointments.filter(
        (a) => a.status === "pending" || a.status === "confirmed"
      );
    if (status === "past") return appointments.filter((a) => a.status === "completed");
    return appointments.filter((a) => a.status === "cancelled");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={loadAppointments}>
          <Text style={styles.primaryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const filtered = filterAppointments(tab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Appointments</Text>
          <Text style={styles.subtitle}>
            Manage your healthcare appointments
          </Text>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("BookAppointment")}
        >
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.primaryText}>Book New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["upcoming", "past", "cancelled"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t as any)}
            style={[
              styles.tab,
              tab === t && { backgroundColor: "#2563eb" },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                tab === t && { color: "#fff", fontWeight: "600" },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} (
              {filterAppointments(t).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointment List */}
      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>No {tab} appointments</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.appointment_id.toString()}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { color: "#2563eb" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSubtitle: { fontSize: 12, color: "#6b7280" },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "500" },
  cardDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardDetailText: { marginLeft: 6, color: "#374151", fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  outlineText: { color: "#2563eb", fontWeight: "500" },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ghostText: { fontWeight: "500" },
  errorText: { color: "#ef4444", marginBottom: 8, fontSize: 16 },
  loadingText: { marginTop: 10, color: "#374151" },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 32,
    fontSize: 16,
  },
});
