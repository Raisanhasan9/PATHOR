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
  success: "#10B981",
};

const TYPE_FILTERS = [
  "All",
  "Beach",
  "Hills",
  "Forest",
  "Heritage",
  "River",
  "Tea Garden",
];
const DIVISIONS = [
  "All",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Dhaka",
  "Barisal",
  "Mymensingh",
];

export default function Explore() {
  const router = useRouter();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeDivision, setActiveDivision] = useState("All");

  // ── Fetch destinations with filters ──────────────────────
  const fetchDestinations = useCallback(async () => {
    try {
      const params = {};
      if (activeFilter !== "All") params.category = activeFilter;
      if (activeDivision !== "All") params.division = activeDivision;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get("/destinations", { params });
      setDestinations(res.data.data || []);
    } catch (err) {
      console.error("Explore fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeDivision, search]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchDestinations();
    }, 400); // debounce search
    return () => clearTimeout(timeout);
  }, [activeFilter, activeDivision, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDestinations();
    setRefreshing(false);
  };

  const statusColor = (status) => {
    if (status === "alert" || status === "closed") return T.warning;
    return T.success;
  };

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

      {/* ── Header ─────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: "rgba(16,185,129,0.12)",
          borderWidth: 1,
          borderColor: T.border2,
          paddingTop: 56,
          paddingBottom: 24,
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
            marginBottom: 16,
          }}
        >
          <View>
            <Text style={{ color: T.text, fontSize: 22, fontWeight: "900" }}>
              Explore 🗺️
            </Text>
            <Text style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>
              {loading
                ? "Loading..."
                : `${destinations.length} destinations found`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: T.greenSoft,
              borderWidth: 1,
              borderColor: T.border2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: T.green }}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
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
            placeholder="Search destinations, tags..."
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
        <View style={{ paddingTop: 20 }}>
          {/* ── Type Filter ──────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: 20, marginBottom: 12 }}
          >
            <View style={{ flexDirection: "row", gap: 8, paddingRight: 20 }}>
              {TYPE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: activeFilter === f ? T.green : T.card,
                    borderWidth: 1,
                    borderColor: activeFilter === f ? T.green : T.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: activeFilter === f ? "#022C22" : T.text,
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ── Division Filter ──────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: 20, marginBottom: 20 }}
          >
            <View style={{ flexDirection: "row", gap: 8, paddingRight: 20 }}>
              {DIVISIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setActiveDivision(d)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: activeDivision === d ? T.green2 : T.card,
                    borderWidth: 1,
                    borderColor: activeDivision === d ? T.green2 : T.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: activeDivision === d ? "#fff" : T.muted,
                    }}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ── Results ──────────────────────────────────── */}
          <View style={{ paddingHorizontal: 20, gap: 14, paddingBottom: 110 }}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={T.green}
                style={{ marginTop: 40 }}
              />
            ) : destinations.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 48 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: T.text }}
                >
                  No destinations found
                </Text>
                <Text style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
                  Try a different search or filter
                </Text>
              </View>
            ) : (
              destinations.map((dest) => (
                <TouchableOpacity
                  key={dest._id}
                  onPress={() =>
                    router.push({
                      pathname: "/(traveller)/destination",
                      params: { id: dest._id },
                    })
                  }
                  style={{
                    backgroundColor: T.card,
                    borderRadius: 20,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  {/* Card Top */}
                  <View
                    style={{
                      backgroundColor:
                        dest.status === "alert"
                          ? T.warning + "18"
                          : T.greenSoft,
                      padding: 20,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
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
                      <Text style={{ fontSize: 32 }}>🏞️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "800",
                          color: T.text,
                        }}
                      >
                        {dest.name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                      >
                        📍 {dest.division || "Bangladesh"}
                        {dest.category ? ` • ${dest.category}` : ""}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 6,
                        }}
                      >
                        {dest.averageRating > 0 && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: T.text3,
                              fontWeight: "700",
                            }}
                          >
                            ⭐ {dest.averageRating?.toFixed(1)}
                          </Text>
                        )}
                        {dest.guideCount > 0 && (
                          <Text style={{ fontSize: 12, color: T.muted }}>
                            • 🧭 {dest.guideCount} guides
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Card Bottom */}
                  <View
                    style={{
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      {dest.description ? (
                        <Text
                          style={{
                            fontSize: 13,
                            color: T.muted,
                            lineHeight: 18,
                          }}
                          numberOfLines={2}
                        >
                          {dest.description}
                        </Text>
                      ) : null}

                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginTop: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Status badge */}
                        <View
                          style={{
                            backgroundColor: statusColor(dest.status) + "22",
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            borderRadius: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: statusColor(dest.status),
                            }}
                          >
                            {dest.status === "alert"
                              ? "⚠️ Alert"
                              : dest.status === "closed"
                                ? "🔴 Closed"
                                : "✅ Safe"}
                          </Text>
                        </View>

                        {/* Tags */}
                        {dest.tags?.slice(0, 2).map((tag, i) => (
                          <View
                            key={i}
                            style={{
                              backgroundColor: T.greenSoft,
                              paddingVertical: 4,
                              paddingHorizontal: 10,
                              borderRadius: 20,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: T.green,
                              }}
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(traveller)/destination",
                          params: { id: dest._id },
                        })
                      }
                      style={{
                        backgroundColor: T.green,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 14,
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#022C22",
                          fontSize: 13,
                          fontWeight: "800",
                        }}
                      >
                        Explore →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Nav ─────────────────────────────────────── */}
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
                fontWeight: tab.label === "Explore" ? "800" : "600",
                color: tab.label === "Explore" ? T.green : T.muted,
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
