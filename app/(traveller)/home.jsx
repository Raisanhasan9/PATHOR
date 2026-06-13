import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
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
  input: "rgba(5,22,12,0.75)",
  placeholder: "rgba(110,231,183,0.35)",
  orb: "rgba(5,120,80,0.22)",
  warning: "#F59E0B",
  danger: "#EF4444",
  success: "#10B981",
};

const categories = [
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "hills", label: "Hills", emoji: "⛰️" },
  { id: "forest", label: "Forest", emoji: "🌿" },
  { id: "heritage", label: "Heritage", emoji: "🏛️" },
  { id: "river", label: "River", emoji: "🚤" },
  { id: "tea", label: "Tea", emoji: "🍃" },
];

const alertColor = (severity) => {
  if (severity === "high") return "#EF4444";
  if (severity === "medium") return "#F59E0B";
  return "#10B981";
};

// ── Safely extract an array from any API response shape ──────────────────────
function extractArray(data) {
  if (!data) return [];
  // { success, data: [...] }
  if (Array.isArray(data.data)) return data.data;
  // { success, data: { destinations: [...] } }
  if (data.data && typeof data.data === "object") {
    const inner = Object.values(data.data).find((v) => Array.isArray(v));
    if (inner) return inner;
  }
  // top-level array
  if (Array.isArray(data)) return data;
  // { destinations: [...] } or { alerts: [...] }
  const topLevel = Object.values(data).find((v) => Array.isArray(v));
  if (topLevel) return topLevel;
  return [];
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [destinations, setDestinations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingDest, setLoadingDest] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // ── Fetch Featured Destinations ───────────────────────────────────────────
  const fetchDestinations = async () => {
    try {
      const res = await apiClient.get("/destinations/featured");
      setDestinations(extractArray(res.data));
    } catch (err) {
      console.error("Destinations error:", err.response?.data || err.message);
      setDestinations([]);
    } finally {
      setLoadingDest(false);
    }
  };

  // ── Fetch Alerts ──────────────────────────────────────────────────────────
  const fetchAlerts = async () => {
    try {
      const res = await apiClient.get("/alerts");
      setAlerts(extractArray(res.data));
    } catch (err) {
      console.error("Alerts error:", err.response?.data || err.message);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const loadAll = useCallback(async () => {
    await Promise.all([fetchDestinations(), fetchAlerts()]);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setLoadingDest(true);
    setLoadingAlerts(true);
    await loadAll();
    setRefreshing(false);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = Array.isArray(destinations)
    ? destinations.filter((d) => {
        const matchSearch = d.name
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const matchCat = activeCategory
          ? d.category?.toLowerCase() === activeCategory ||
            d.tags?.includes(activeCategory)
          : true;
        return matchSearch && matchCat;
      })
    : [];

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
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: "rgba(16,185,129,0.12)",
            borderWidth: 1,
            borderColor: T.border2,
            paddingTop: 56,
            paddingBottom: 28,
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
            <View>
              <Text
                style={{
                  color: T.text3,
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 3,
                }}
              >
                PATHOR • পথর
              </Text>
              <Text
                style={{
                  color: T.text,
                  fontSize: 22,
                  fontWeight: "900",
                  marginTop: 4,
                }}
              >
                আস্সালামুয়ালাইকুম 👋
              </Text>
              <Text style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>
                {user?.name
                  ? `Welcome, ${user.name}`
                  : "Where are you exploring today?"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(traveller)/emergency")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: T.greenSoft,
                borderWidth: 1,
                borderColor: T.border2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 22 }}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: T.input,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: T.border,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search destinations..."
              placeholderTextColor={T.placeholder}
              style={{ flex: 1, fontSize: 15, color: T.text }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={{ fontSize: 16, color: T.muted }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── Live Alerts ──────────────────────────────────────────────── */}
          {!loadingAlerts && alerts.length > 0 && (
            <View style={{ marginBottom: 28 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: T.text,
                  marginBottom: 12,
                  letterSpacing: 0.3,
                }}
              >
                🚨 Live Alerts
              </Text>
              {alerts.map((alert, i) => (
                <View
                  key={alert._id || i}
                  style={{
                    backgroundColor: alertColor(alert.severity) + "18",
                    borderLeftWidth: 4,
                    borderLeftColor: alertColor(alert.severity),
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>
                    {alert.severity === "high"
                      ? "🔴"
                      : alert.severity === "medium"
                        ? "🟡"
                        : "🟢"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: T.text,
                        marginBottom: 2,
                      }}
                    >
                      {alert.title}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: T.muted, lineHeight: 18 }}
                    >
                      {alert.message}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Categories ───────────────────────────────────────────────── */}
          <View style={{ marginBottom: 28 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: T.text,
                marginBottom: 12,
              }}
            >
              Explore by Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() =>
                        setActiveCategory(isActive ? null : cat.id)
                      }
                      style={{
                        backgroundColor: isActive ? T.green : T.card,
                        borderRadius: 20,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        borderWidth: 1,
                        borderColor: isActive ? T.green : T.border,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: isActive ? "#022C22" : T.text,
                        }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* ── Featured Destinations ────────────────────────────────────── */}
          <View style={{ marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: T.text }}>
                ✨ Popular Destinations
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(traveller)/explore")}
              >
                <Text
                  style={{ fontSize: 13, color: T.green, fontWeight: "700" }}
                >
                  See All →
                </Text>
              </TouchableOpacity>
            </View>

            {loadingDest ? (
              <ActivityIndicator
                size="large"
                color={T.green}
                style={{ marginTop: 24 }}
              />
            ) : filtered.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 32 }}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🗺️</Text>
                <Text style={{ color: T.muted, fontSize: 14 }}>
                  {search
                    ? "No destinations found."
                    : "No featured destinations yet."}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {filtered.map((dest, i) => (
                  <TouchableOpacity
                    key={dest._id || i}
                    onPress={() =>
                      router.push({
                        pathname: "/(traveller)/destination",
                        params: { id: dest._id },
                      })
                    }
                    style={{
                      backgroundColor: T.card,
                      borderRadius: 20,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: T.border,
                    }}
                  >
                    {/* Emoji thumbnail */}
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: T.greenSoft,
                        borderWidth: 1,
                        borderColor: T.border2,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>🏞️</Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: T.text,
                        }}
                      >
                        {dest.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: T.muted,
                          marginTop: 2,
                        }}
                      >
                        📍 {dest.division || dest.location || "Bangladesh"}
                        {dest.category ? ` • ${dest.category}` : ""}
                      </Text>
                      {dest.averageRating > 0 && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: T.text3,
                            marginTop: 4,
                            fontWeight: "700",
                          }}
                        >
                          ⭐ {dest.averageRating?.toFixed(1)}
                        </Text>
                      )}
                      {Array.isArray(dest.tags) && dest.tags.length > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 6,
                            marginTop: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {dest.tags.slice(0, 2).map((tag, j) => (
                            <View
                              key={j}
                              style={{
                                backgroundColor: T.greenSoft,
                                borderRadius: 20,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: T.green,
                                  fontWeight: "700",
                                }}
                              >
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <Text style={{ fontSize: 20, color: T.muted }}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <View style={{ marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: T.text,
                marginBottom: 12,
              }}
            >
              Quick Actions
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {[
                {
                  label: "Find Guide",
                  emoji: "🧭",
                  route: "/(traveller)/explore",
                },
                {
                  label: "Cost Planner",
                  emoji: "💰",
                  route: "/(traveller)/costplanner",
                },
                {
                  label: "Emergency",
                  emoji: "🆘",
                  route: "/(traveller)/emergency",
                },
                {
                  label: "Community",
                  emoji: "🌐",
                  route: "/(traveller)/feed",
                },
              ].map((action) => (
                <TouchableOpacity
                  key={action.label}
                  onPress={() => router.push(action.route)}
                  style={{
                    backgroundColor: T.card,
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                    width: (width - 52) / 2,
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>
                    {action.emoji}
                  </Text>
                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: T.text }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Nav ───────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: T.card,
          borderTopWidth: 1,
          borderTopColor: T.border,
          paddingVertical: 12,
          paddingHorizontal: 24,
        }}
      >
        {[
          { label: "Home", emoji: "🏠", route: "/(traveller)/home" },
          { label: "Explore", emoji: "🧭", route: "/(traveller)/explore" },
          { label: "Emergency", emoji: "🆘", route: "/(traveller)/emergency" },
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
                color: T.muted,
                marginTop: 2,
                fontWeight: "600",
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
