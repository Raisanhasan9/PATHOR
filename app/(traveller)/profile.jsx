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
import useAuthStore from "../../store/authStore";
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

const MENU_ITEMS = [
  { label: "Trip Checklist", emoji: "✅", route: "/(traveller)/checklist" },
  { label: "Cost Planner", emoji: "💰", route: "/(traveller)/costplanner" },
  { label: "My Bookings", emoji: "🧭", route: "/(traveller)/booking" },
  { label: "Emergency", emoji: "🆘", route: "/(traveller)/emergency" },
  { label: "Notifications", emoji: "🔔", route: null },
  { label: "Help & Support", emoji: "💬", route: null },
  { label: "Logout", emoji: "🚪", route: null, danger: true },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("trips");

  // ── Fetch profile + trips ─────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/users/profile");
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error:", err.response?.data || err.message);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await apiClient.get("/trips");
      setTrips(res.data.data || []);
    } catch (err) {
      console.error("Trips fetch error:", err.response?.data || err.message);
    }
  };

  const loadAll = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchTrips()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // ── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // ── Menu press ────────────────────────────────────────
  const handleMenu = (item) => {
    if (item.label === "Logout") {
      handleLogout();
      return;
    }
    if (item.route) {
      router.push(item.route);
      return;
    }
    Alert.alert("Coming Soon", `${item.label} will be available soon.`);
  };

  // ── Stats from real data ──────────────────────────────
  const stats = [
    { label: "Trips", value: trips.length, emoji: "✈️" },
    { label: "Posts", value: profile?.postCount ?? 0, emoji: "📸" },
    { label: "Reviews", value: profile?.reviewCount ?? 0, emoji: "⭐" },
    { label: "Saved", value: profile?.savedCount ?? 0, emoji: "🔖" },
  ];

  const displayUser = profile || user;

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
        <ActivityIndicator size="large" color={T.green} />
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
          top: -160,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: 400,
          backgroundColor: T.orb,
          opacity: 0.55,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: 280,
          backgroundColor: T.orb,
          opacity: 0.38,
        }}
        pointerEvents="none"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.green}
          />
        }
      >
        {/* ── Hero ─────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: "rgba(16,185,129,0.12)",
            borderWidth: 1,
            borderColor: T.border2,
            paddingTop: 56,
            paddingBottom: 36,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            alignItems: "center",
          }}
        >
          {/* Settings icon */}
          <TouchableOpacity
            style={{ position: "absolute", top: 56, right: 24 }}
          >
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </TouchableOpacity>

          {/* Avatar */}
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: T.greenSoft,
              borderWidth: 2,
              borderColor: T.border2,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: T.text,
              marginBottom: 4,
            }}
          >
            {displayUser?.name || "Traveller"}
          </Text>
          <Text style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
            {displayUser?.email || ""}
            {displayUser?.phone ? ` • ${displayUser.phone}` : ""}
          </Text>

          {/* Badges from profile */}
          {profile?.badges?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {profile.badges.map((badge, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: T.greenSoft,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: T.border,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>🏅</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: T.text2,
                        fontWeight: "700",
                      }}
                    >
                      {badge}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── Stats ────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: T.card,
              borderRadius: 20,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: T.border,
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
                  style={{ fontSize: 20, fontWeight: "900", color: T.green }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Tabs ─────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: T.card,
              borderRadius: 16,
              padding: 4,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            {["trips", "menu"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 13,
                  alignItems: "center",
                  backgroundColor: activeTab === tab ? T.green : "transparent",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: activeTab === tab ? "#022C22" : T.muted,
                  }}
                >
                  {tab === "trips" ? "✈️ My Trips" : "⚙️ Settings"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Trips Tab ────────────────────────────────── */}
          {activeTab === "trips" && (
            <View style={{ gap: 12, marginBottom: 40 }}>
              {trips.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>✈️</Text>
                  <Text
                    style={{ color: T.text, fontSize: 16, fontWeight: "700" }}
                  >
                    No trips yet
                  </Text>
                  <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
                    Start planning your first trip!
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(traveller)/costplanner")}
                    style={{
                      marginTop: 16,
                      backgroundColor: T.green,
                      paddingVertical: 10,
                      paddingHorizontal: 24,
                      borderRadius: 14,
                    }}
                  >
                    <Text style={{ color: "#022C22", fontWeight: "800" }}>
                      Plan a Trip →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                trips.map((trip) => (
                  <TouchableOpacity
                    key={trip._id}
                    onPress={() =>
                      router.push({
                        pathname: "/(traveller)/trip-summary",
                        params: { id: trip._id },
                      })
                    }
                    style={{
                      backgroundColor: T.card,
                      borderRadius: 18,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: T.border,
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor:
                          trip.status === "upcoming"
                            ? T.accent + "22"
                            : T.greenSoft,
                        borderWidth: 1,
                        borderColor: T.border2,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Text style={{ fontSize: 26 }}>🧳</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: T.text,
                        }}
                      >
                        {trip.destination || trip.title || "Trip"}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                      >
                        📅{" "}
                        {trip.startDate
                          ? new Date(trip.startDate).toLocaleDateString(
                              "en-GB",
                              { month: "short", year: "numeric" },
                            )
                          : "No date"}
                        {trip.days ? ` • ${trip.days} days` : ""}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor:
                          trip.status === "upcoming"
                            ? T.accent + "22"
                            : trip.status === "ongoing"
                              ? T.green + "22"
                              : T.greenSoft,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color:
                            trip.status === "upcoming"
                              ? T.accent
                              : trip.status === "ongoing"
                                ? T.green
                                : T.text3,
                          textTransform: "capitalize",
                        }}
                      >
                        {trip.status === "upcoming"
                          ? "🗓️ Upcoming"
                          : trip.status === "ongoing"
                            ? "🟢 Ongoing"
                            : "✅ Done"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* ── Settings Tab ─────────────────────────────── */}
          {activeTab === "menu" && (
            <View style={{ gap: 10, marginBottom: 40 }}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleMenu(item)}
                  style={{
                    backgroundColor: T.card,
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: item.danger ? T.danger + "44" : T.border,
                  }}
                >
                  <Text style={{ fontSize: 22, marginRight: 14 }}>
                    {item.emoji}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "600",
                      color: item.danger ? T.danger : T.text,
                    }}
                  >
                    {item.label}
                  </Text>
                  {!item.danger && (
                    <Text style={{ fontSize: 18, color: T.muted }}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Nav ───────────────────────────────────── */}
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
        {[
          { label: "Home", emoji: "🏠", route: "/(traveller)/home" },
          { label: "Explore", emoji: "🗺️", route: "/(traveller)/explore" },
          { label: "Feed", emoji: "📸", route: "/(traveller)/feed" },
          { label: "Profile", emoji: "👤", route: "/(traveller)/profile" },
        ].map((tab) => (
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
                fontWeight: tab.label === "Profile" ? "800" : "600",
                color: tab.label === "Profile" ? T.green : T.muted,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
