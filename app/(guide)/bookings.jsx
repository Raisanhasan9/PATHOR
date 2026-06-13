import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../utils/apiClient";

const T = {
  bg: "#020B06",
  text: "#ECFDF5",
  text2: "#A7F3D0",
  text3: "#6EE7B7",
  muted: "rgba(167,243,208,0.5)",
  green: "#10B981",
  green2: "#059669",
  greenSoft: "rgba(16,185,129,0.13)",
  border: "rgba(52,211,153,0.2)",
  border2: "rgba(52,211,153,0.42)",
  card: "rgba(5,22,12,0.92)",
  orb: "rgba(5,120,80,0.22)",
  warning: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  accent: "#F59E0B",
};

const STATUS_META = {
  confirmed: { bg: `${T.success}22`, color: T.success, label: "✅ Confirmed" },
  pending: { bg: `${T.warning}22`, color: T.warning, label: "⏳ Pending" },
  completed: { bg: `${T.green2}22`, color: T.text2, label: "🏁 Completed" },
  cancelled: { bg: `${T.danger}22`, color: T.danger, label: "❌ Cancelled" },
};

const TABS = ["All", "Pending", "Confirmed", "Completed"];

const NAV_TABS = [
  { label: "Dashboard", emoji: "🏠", route: "/(guide)/dashboard" },
  { label: "Bookings", emoji: "📅", route: "/(guide)/bookings" },
  { label: "Earnings", emoji: "💰", route: "/(guide)/earnings" },
];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Bookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [expanded, setExpanded] = useState(null);
  // per-booking respond loading: { [id]: 'accept' | 'decline' | null }
  const [responding, setResponding] = useState({});

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      const res = await apiClient.get("/bookings/guide");
      if (res.data?.success) {
        setBookings(res.data.data ?? []);
      } else {
        throw new Error(res.data?.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Guide bookings fetch error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not load bookings.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  // ── Respond ───────────────────────────────────────────────────────────────
  const handleRespond = async (bookingId, action) => {
    setResponding((prev) => ({ ...prev, [bookingId]: action }));
    try {
      const res = await apiClient.put(`/bookings/${bookingId}/respond`, {
        status: action === "accept" ? "confirmed" : "cancelled",
      });
      if (res.data?.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  status: action === "accept" ? "confirmed" : "cancelled",
                }
              : b,
          ),
        );
        // Collapse card after acting
        setExpanded(null);
      } else {
        throw new Error(res.data?.message || "Response failed");
      }
    } catch (err) {
      console.error("Booking respond error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not update booking.",
      );
    } finally {
      setResponding((prev) => ({ ...prev, [bookingId]: null }));
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered =
    activeTab === "All"
      ? bookings
      : bookings.filter(
          (b) => b.status?.toLowerCase() === activeTab.toLowerCase(),
        );

  const pendingCount = bookings.filter(
    (b) => b.status?.toLowerCase() === "pending",
  ).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={T.green} />
        <Text style={{ color: T.muted, marginTop: 12, fontSize: 13 }}>
          Loading bookings…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="light" />

      {/* Ambient orbs */}
      <View
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: T.orb,
          opacity: 0.6,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 200,
          left: -60,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: T.orb,
          opacity: 0.35,
        }}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: T.green2,
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "800",
            marginBottom: 4,
          }}
        >
          My Bookings 📅
        </Text>
        <Text style={{ color: "#ffffff99", fontSize: 13, marginBottom: 16 }}>
          {pendingCount > 0
            ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}`
            : "No pending requests"}
        </Text>

        {/* Tab pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 20,
                    backgroundColor: active ? "#fff" : "#ffffff22",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: active ? T.green2 : "#fff",
                    }}
                  >
                    {tab}
                    {tab === "Pending" && pendingCount > 0
                      ? ` (${pendingCount})`
                      : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Booking List ───────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.green}
            colors={[T.green]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 100,
          gap: 12,
        }}
      >
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: T.text }}>
              No bookings here
            </Text>
            <Text style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
              Check a different tab
            </Text>
          </View>
        ) : (
          filtered.map((booking) => {
            const bookingId = booking._id;
            const statusKey = booking.status?.toLowerCase() ?? "pending";
            const meta = STATUS_META[statusKey] ?? STATUS_META.pending;
            const isPending = statusKey === "pending";
            const isConfirmed = statusKey === "confirmed";
            const isCompleted = statusKey === "completed";
            const isOpen = expanded === bookingId;
            const actionLoading = responding[bookingId];

            const travellerName =
              booking.traveller?.name ?? booking.travellerName ?? "Traveller";
            const travellerPhone =
              booking.traveller?.phone ?? booking.phone ?? null;
            const destination =
              booking.destination ?? booking.destinationName ?? "—";
            const destEmoji = booking.destinationEmoji ?? booking.emoji ?? "📍";
            const days = booking.days ?? booking.duration ?? null;
            const people = booking.people ?? booking.groupSize ?? null;
            const amount = booking.amount ?? booking.price ?? 0;
            const bookingType = booking.type ?? booking.bookingType ?? null;
            const startDate = booking.date ?? booking.startDate;

            return (
              <View
                key={bookingId}
                style={{
                  backgroundColor: T.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: T.border,
                  overflow: "hidden",
                  elevation: 2,
                }}
              >
                {/* ── Card header (tappable) ─────────────────────────────── */}
                <TouchableOpacity
                  onPress={() => setExpanded(isOpen ? null : bookingId)}
                  style={{ padding: 16 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: T.greenSoft,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 26 }}>
                        {booking.traveller?.avatar ??
                          booking.traveller?.emoji ??
                          "👤"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: T.text,
                        }}
                      >
                        {travellerName}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                      >
                        {destEmoji} {destination}
                        {days ? ` • ${days} day${days > 1 ? "s" : ""}` : ""}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: meta.bg,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <Text style={{ fontSize: 12, color: T.muted }}>
                        📅 {formatDate(startDate)}
                      </Text>
                      {people && (
                        <Text style={{ fontSize: 12, color: T.muted }}>
                          👥 {people} {people === 1 ? "person" : "people"}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color: T.green,
                      }}
                    >
                      ৳{Number(amount).toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* ── Expanded details ──────────────────────────────────── */}
                {isOpen && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: T.border,
                      padding: 16,
                      backgroundColor: T.bg,
                      gap: 10,
                    }}
                  >
                    {/* Info chips */}
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {bookingType && (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: T.card,
                            borderRadius: 12,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: T.border,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: T.muted }}>
                            Booking Type
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: T.text,
                              marginTop: 2,
                            }}
                          >
                            {bookingType === "Instant" ? "⚡" : "📋"}{" "}
                            {bookingType}
                          </Text>
                        </View>
                      )}
                      {travellerPhone && (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: T.card,
                            borderRadius: 12,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: T.border,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: T.muted }}>
                            Phone
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: T.text,
                              marginTop: 2,
                            }}
                          >
                            📞 {travellerPhone}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Notes / message from traveller */}
                    {booking.notes && (
                      <View
                        style={{
                          backgroundColor: T.card,
                          borderRadius: 12,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: T.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: T.muted,
                            marginBottom: 4,
                          }}
                        >
                          Traveller Note
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: T.text2,
                            lineHeight: 18,
                          }}
                        >
                          "{booking.notes}"
                        </Text>
                      </View>
                    )}

                    {/* Pending — accept / decline */}
                    {isPending && (
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity
                          onPress={() => handleRespond(bookingId, "accept")}
                          disabled={!!actionLoading}
                          style={{
                            flex: 1,
                            backgroundColor: T.success,
                            paddingVertical: 12,
                            borderRadius: 14,
                            alignItems: "center",
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          {actionLoading === "accept" ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "700",
                                fontSize: 14,
                              }}
                            >
                              ✅ Accept
                            </Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRespond(bookingId, "decline")}
                          disabled={!!actionLoading}
                          style={{
                            flex: 1,
                            backgroundColor: `${T.danger}18`,
                            paddingVertical: 12,
                            borderRadius: 14,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: `${T.danger}44`,
                            opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          {actionLoading === "decline" ? (
                            <ActivityIndicator size="small" color={T.danger} />
                          ) : (
                            <Text
                              style={{
                                color: T.danger,
                                fontWeight: "700",
                                fontSize: 14,
                              }}
                            >
                              ❌ Decline
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Confirmed — message button (stub; wire up messaging later) */}
                    {isConfirmed && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: T.green,
                          paddingVertical: 12,
                          borderRadius: 14,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          💬 Message Traveller
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Completed — receipt pill */}
                    {isCompleted && (
                      <View
                        style={{
                          backgroundColor: `${T.green}11`,
                          borderRadius: 12,
                          padding: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: T.green,
                            fontWeight: "600",
                          }}
                        >
                          🏁 Trip completed • Payment received
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Bottom Nav ────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: T.card,
          borderTopWidth: 1,
          borderTopColor: T.border,
          paddingVertical: 12,
          paddingHorizontal: 24,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {NAV_TABS.map((tab) => {
          const active = tab.label === "Bookings";
          return (
            <TouchableOpacity
              key={tab.label}
              onPress={() => router.replace(tab.route)}
              style={{ flex: 1, alignItems: "center" }}
            >
              <Text style={{ fontSize: 22 }}>{tab.emoji}</Text>
              <Text
                style={{
                  fontSize: 11,
                  marginTop: 2,
                  color: active ? T.green : T.muted,
                  fontWeight: active ? "800" : "600",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
