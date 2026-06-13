import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "../../store/authStore";
import apiClient from "../../utils/apiClient";

const { width } = Dimensions.get("window");

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

const QUICK_ACTIONS = [
  { label: "My Calendar", emoji: "📅", route: "/(guide)/bookings" },
  { label: "Earnings", emoji: "💰", route: "/(guide)/earnings" },
  { label: "My Profile", emoji: "👤", route: "/(guide)/profile" },
  { label: "Bookings", emoji: "📋", route: "/(guide)/bookings" },
];

const NAV_TABS = [
  { label: "Dashboard", emoji: "🏠", route: "/(guide)/dashboard" },
  { label: "Bookings", emoji: "📅", route: "/(guide)/bookings" },
  { label: "Earnings", emoji: "💰", route: "/(guide)/earnings" },
];

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function GuideDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);
  // per-booking respond loading: { [bookingId]: 'accept'|'decline'|null }
  const [responding, setResponding] = useState({});

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        apiClient.get("/guides/me"),
        apiClient.get("/bookings/guide"),
      ]);

      if (profileRes.data?.success) {
        const p = profileRes.data.data;
        setProfile(p);
        setAvailable(p.isAvailable ?? p.available ?? true);
      }

      if (bookingsRes.data?.success) {
        const all = bookingsRes.data.data ?? [];
        // Show only the 3 most recent on dashboard
        setBookings(all.slice(0, 3));
      }
    } catch (err) {
      console.error("Guide dashboard fetch error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not load dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ── Toggle availability ───────────────────────────────────────────────────
  const handleToggleAvailability = async () => {
    const next = !available;
    setTogglingAvail(true);
    try {
      const res = await apiClient.put("/guides/me", { isAvailable: next });
      if (res.data?.success) {
        setAvailable(next);
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Toggle availability error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not update availability.",
      );
    } finally {
      setTogglingAvail(false);
    }
  };

  // ── Respond to booking ────────────────────────────────────────────────────
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
          Loading dashboard…
        </Text>
      </View>
    );
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const guideName = profile?.name ?? profile?.fullName ?? user?.name ?? "Guide";
  const guideArea = profile?.area ?? profile?.location ?? "";
  const rating =
    profile?.rating != null ? Number(profile.rating).toFixed(1) : "—";
  const totalEarnings = profile?.totalEarnings ?? profile?.earnings ?? 0;
  const totalBookings = profile?.totalBookings ?? profile?.bookingCount ?? 0;
  const trustScore = profile?.trustScore ?? profile?.trust ?? null;

  const stats = [
    {
      label: "Earnings",
      value: `৳${(totalEarnings / 1000).toFixed(1)}k`,
      emoji: "💰",
    },
    { label: "Bookings", value: String(totalBookings), emoji: "📅" },
    { label: "Rating", value: rating, emoji: "⭐" },
    ...(trustScore != null
      ? [{ label: "Trust", value: `${trustScore}%`, emoji: "🛡️" }]
      : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="light" />

      {/* Ambient orbs */}
      <View
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: T.orb,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 280,
          left: -70,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: T.orb,
          opacity: 0.4,
        }}
      />

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
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: T.green2,
            paddingTop: 56,
            paddingBottom: 32,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#ffffff88",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                PATHOR GUIDE PORTAL
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "800",
                  marginTop: 2,
                }}
              >
                {guideName} 🧭
              </Text>
              {guideArea ? (
                <Text
                  style={{ color: "#ffffff99", fontSize: 13, marginTop: 2 }}
                >
                  📍 {guideArea} • Verified Guide ✅
                </Text>
              ) : null}
            </View>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#ffffff22",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 30 }}>🧔</Text>
            </View>
          </View>

          {/* Availability toggle */}
          <TouchableOpacity
            onPress={handleToggleAvailability}
            disabled={togglingAvail}
            style={{
              backgroundColor: available ? `${T.success}33` : "#ffffff22",
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: available ? `${T.success}66` : "#ffffff33",
              opacity: togglingAvail ? 0.6 : 1,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {togglingAvail ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ fontSize: 20 }}>{available ? "🟢" : "🔴"}</Text>
              )}
              <View>
                <Text
                  style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                >
                  {available
                    ? "Available for Bookings"
                    : "Currently Unavailable"}
                </Text>
                <Text
                  style={{ color: "#ffffff88", fontSize: 11, marginTop: 1 }}
                >
                  Tap to toggle your availability
                </Text>
              </View>
            </View>
            {/* Toggle pill */}
            <View
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: available ? T.success : "#ffffff44",
                justifyContent: "center",
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  alignSelf: available ? "flex-end" : "flex-start",
                }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* ── Stats Row ────────────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: T.card,
              borderRadius: 20,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: T.border,
              elevation: 2,
            }}
          >
            {stats.map((stat, i) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRightWidth: i < stats.length - 1 ? 1 : 0,
                  borderRightColor: T.border,
                }}
              >
                <Text style={{ fontSize: 18, marginBottom: 4 }}>
                  {stat.emoji}
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: T.green }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: T.text,
              marginBottom: 14,
            }}
          >
            Quick Actions
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route)}
                style={{
                  backgroundColor: T.card,
                  borderRadius: 20,
                  padding: 20,
                  alignItems: "center",
                  width: (width - 60) / 2,
                  borderWidth: 1,
                  borderColor: T.border,
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.07,
                  shadowRadius: 6,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: T.greenSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{action.emoji}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: T.text,
                    textAlign: "center",
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Recent Bookings ───────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: T.text }}>
              Recent Bookings
            </Text>
            <TouchableOpacity onPress={() => router.push("/(guide)/bookings")}>
              <Text style={{ fontSize: 13, color: T.green, fontWeight: "600" }}>
                See All →
              </Text>
            </TouchableOpacity>
          </View>

          {bookings.length === 0 ? (
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 18,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: T.border,
                marginBottom: 100,
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
              <Text
                style={{ color: T.muted, fontSize: 14, textAlign: "center" }}
              >
                No bookings yet. They'll appear here once travellers book you.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12, marginBottom: 100 }}>
              {bookings.map((booking) => {
                const statusKey = booking.status?.toLowerCase() ?? "pending";
                const meta = STATUS_META[statusKey] ?? STATUS_META.pending;
                const bookingId = booking._id;
                const isPending = statusKey === "pending";
                const actionLoading = responding[bookingId];

                return (
                  <View
                    key={bookingId}
                    style={{
                      backgroundColor: T.card,
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: T.border,
                      elevation: 2,
                    }}
                  >
                    {/* Top row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: T.greenSoft,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 24 }}>
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
                          {booking.traveller?.name ??
                            booking.travellerName ??
                            "Traveller"}
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                        >
                          📍{" "}
                          {booking.destination ??
                            booking.destinationName ??
                            "—"}
                          {booking.days ? ` • ${booking.days} days` : ""}
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

                    {/* Bottom row */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: T.border,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: T.muted }}>
                        📅 {formatDate(booking.date ?? booking.startDate)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "800",
                          color: T.green,
                        }}
                      >
                        ৳
                        {(
                          booking.amount ??
                          booking.price ??
                          0
                        ).toLocaleString()}
                      </Text>
                    </View>

                    {/* Accept / Decline for pending */}
                    {isPending && (
                      <View
                        style={{ flexDirection: "row", gap: 10, marginTop: 12 }}
                      >
                        <TouchableOpacity
                          onPress={() => handleRespond(bookingId, "accept")}
                          disabled={!!actionLoading}
                          style={{
                            flex: 1,
                            backgroundColor: T.success,
                            paddingVertical: 10,
                            borderRadius: 12,
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
                                fontSize: 13,
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
                            paddingVertical: 10,
                            borderRadius: 12,
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
                                fontSize: 13,
                              }}
                            >
                              ❌ Decline
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
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
          const active = tab.label === "Dashboard";
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
