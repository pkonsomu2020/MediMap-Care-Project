import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },

  header: {
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#6B7280" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    marginBottom: 16,
  },
  searchInput: { flex: 1, paddingVertical: 6, marginLeft: 8 },
  searchButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: { color: "#fff", fontWeight: "600" },

  mapPlaceholder: {
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6E9EE",
  },
  mapText: { color: "#6B7280", marginTop: 6 },
  mapSubText: { color: "#9CA3AF", fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECEFF4",
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1, marginLeft: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clinicName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  smallText: { color: "#6B7280", marginLeft: 6, flexShrink: 1 },
  starRow: { flexDirection: "row", alignItems: "center" },

  badge: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontWeight: "600" },

  sectionTitle: { fontWeight: "600", marginBottom: 4 },
  buttonRow: { flexDirection: "row", marginTop: 12, gap: 2 },
  button: { paddingHorizontal: 5, paddingVertical: 8, borderRadius: 8, alignItems: "center", flexDirection: "row" },
  primaryButton: { backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#fff", fontWeight: "600" },
  outlineButton: { borderWidth: 1, borderColor: "#2563eb", marginLeft: 8 },
  outlineButtonText: { color: "#2563eb", fontWeight: "600" },
  ghostButton: { marginLeft: 8, flexDirection: 'column' },
  ghostButtonText: { color: "#2563eb", marginLeft: 6 },

  centered: { alignItems: "center", justifyContent: "center", marginTop: 20 },
  errorText: { color: "#ef4444", marginBottom: 8 },
  retryButton: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: "#fff" },
});
