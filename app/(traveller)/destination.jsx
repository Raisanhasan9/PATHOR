import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
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
  orb: "rgba(5,120,80,0.22)",
  warning: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  accent: "#F59E0B",
};

export default function Destination() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [destination, setDestination] = useState(null);
  const [guides, setGuides] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // ── Fetch destination details ─────────────────────────
  const fetchDestination = async () => {
    try {
      const res = await apiClient.get(`/destinations/${id}`);
      setDestination(res.data.data);
    } catch (err) {
      console.error(
        "Destination fetch error:",
        err.response?.data || err.message,
      );
    }
  };

  // ── Fetch guides for this destination ─────────────────
  const fetchGuides = async () => {
    try {
      const res = await apiClient.get("/guides", {
        params: { destination: id, limit: 5 },
      });
      setGuides(res.data.data || []);
    } catch (err) {
      console.error("Guides fetch error:", err.response?.data || err.message);
    }
  };

  // ── Fetch live weather ─────────────────────────────────
  const fetchWeather = async () => {
    try {
      const res = await apiClient.get(`/destinations/${id}/weather`);
      setWeather(res.data.data);
    } catch (err) {
      // weather is optional — fail silently
    }
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchDestination(), fetchGuides(), fetchWeather()]);
      setLoading(false);
    };
    load();
  }, [id]);

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
        <Text style={{ color: T.muted, marginTop: 12, fontSize: 14 }}>
          Loading destination...
        </Text>
      </View>
    );
  }

  if (!destination) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 12 }}>😕</Text>
        <Text
          style={{
            color: T.text,
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Not Found
        </Text>
        <Text
          style={{
            color: T.muted,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          This destination could not be loaded.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: T.green,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#022C22", fontWeight: "800" }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor =
    destination.status === "alert"
      ? T.warning
      : destination.status === "closed"
        ? T.danger
        : T.success;

  const statusLabel =
    destination.status === "alert"
      ? "⚠️ Alert"
      : destination.status === "closed"
        ? "🔴 Closed"
        : "✅ Safe";

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ───────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: "rgba(16,185,129,0.12)",
            borderWidth: 1,
            borderColor: T.border2,
            paddingTop: 56,
            paddingBottom: 32,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            alignItems: "center",
          }}
        >
          {/* Top row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={{ color: T.green, fontSize: 15, fontWeight: "700" }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSaved(!saved)}>
              <Text style={{ fontSize: 24 }}>{saved ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: T.greenSoft,
              borderWidth: 1.5,
              borderColor: T.border2,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 52 }}>🏞️</Text>
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: T.text,
              marginBottom: 4,
            }}
          >
            {destination.name}
          </Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 12 }}>
            📍 {destination.division || "Bangladesh"}
            {destination.category ? ` • ${destination.category}` : ""}
          </Text>

          {/* Rating row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: T.greenSoft,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: T.border,
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            {destination.averageRating > 0 && (
              <Text
                style={{ color: T.accent, fontSize: 14, fontWeight: "700" }}
              >
                ⭐ {destination.averageRating?.toFixed(1)}
              </Text>
            )}
            {destination.reviewCount > 0 && (
              <Text style={{ color: T.muted, fontSize: 12 }}>
                {destination.reviewCount} reviews
              </Text>
            )}
            {destination.bestTime && (
              <Text style={{ color: T.muted, fontSize: 12 }}>
                🕐 {destination.bestTime}
              </Text>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── Live Status Board ───────────────────────── */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: T.text,
              marginBottom: 14,
            }}
          >
            🔴 Live Status Board
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {/* Safety Status */}
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 16,
                padding: 14,
                width: (width - 50) / 2,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>🛡️</Text>
              <Text
                style={{ fontSize: 15, fontWeight: "800", color: statusColor }}
              >
                {statusLabel}
              </Text>
              <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                Safety Status
              </Text>
            </View>

            {/* Weather */}
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 16,
                padding: 14,
                width: (width - 50) / 2,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>🌤️</Text>
              <Text
                style={{ fontSize: 15, fontWeight: "800", color: T.accent }}
              >
                {weather?.temperature ? `${weather.temperature}°C` : "--"}
              </Text>
              <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {weather?.condition || "Weather"}
              </Text>
            </View>

            {/* Best Time */}
            {destination.bestTime && (
              <View
                style={{
                  backgroundColor: T.card,
                  borderRadius: 16,
                  padding: 14,
                  width: (width - 50) / 2,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 6 }}>📅</Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "800", color: T.text2 }}
                >
                  {destination.bestTime}
                </Text>
                <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  Best Time
                </Text>
              </View>
            )}

            {/* Guides count */}
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 16,
                padding: 14,
                width: (width - 50) / 2,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>🧭</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: T.green }}>
                {guides.filter((g) => g.isAvailable).length} Free
              </Text>
              <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                Guides Available
              </Text>
            </View>
          </View>

          {/* ── Tabs ────────────────────────────────────── */}
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
            {["overview", "guides", "highlights"].map((tab) => (
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
                    fontSize: 12,
                    color: activeTab === tab ? "#022C22" : T.muted,
                  }}
                >
                  {tab === "overview"
                    ? "📋 Overview"
                    : tab === "guides"
                      ? "🧭 Guides"
                      : "📍 Highlights"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Overview Tab ────────────────────────────── */}
          {activeTab === "overview" && (
            <View style={{ marginBottom: 28 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: T.muted,
                  lineHeight: 24,
                  marginBottom: 16,
                }}
              >
                {destination.description || "No description available."}
              </Text>

              <View
                style={{
                  backgroundColor: T.card,
                  borderRadius: 16,
                  padding: 16,
                  gap: 14,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                {destination.distance && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🚌</Text>
                    <View>
                      <Text style={{ fontSize: 12, color: T.muted }}>
                        Distance from Dhaka
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: T.text,
                          marginTop: 2,
                        }}
                      >
                        {destination.distance}
                      </Text>
                    </View>
                  </View>
                )}

                {destination.entryFee !== undefined && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🎟️</Text>
                    <View>
                      <Text style={{ fontSize: 12, color: T.muted }}>
                        Entry Fee
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: T.text,
                          marginTop: 2,
                        }}
                      >
                        {destination.entryFee === 0
                          ? "Free"
                          : `৳${destination.entryFee}`}
                      </Text>
                    </View>
                  </View>
                )}

                {destination.tags?.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🏷️</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: T.muted,
                          marginBottom: 6,
                        }}
                      >
                        Tags
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        {destination.tags.map((tag, i) => (
                          <View
                            key={i}
                            style={{
                              backgroundColor: T.greenSoft,
                              borderRadius: 20,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                color: T.green,
                                fontWeight: "700",
                              }}
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Guides Tab ──────────────────────────────── */}
          {activeTab === "guides" && (
            <View style={{ gap: 12, marginBottom: 28 }}>
              {guides.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>🧭</Text>
                  <Text style={{ color: T.muted, fontSize: 14 }}>
                    No guides available for this destination.
                  </Text>
                </View>
              ) : (
                guides.map((guide) => (
                  <View
                    key={guide._id}
                    style={{
                      backgroundColor: T.card,
                      borderRadius: 20,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: T.border,
                    }}
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
                          width: 52,
                          height: 52,
                          borderRadius: 26,
                          backgroundColor: T.greenSoft,
                          borderWidth: 1,
                          borderColor: T.border2,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 26 }}>🧔</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: T.text,
                          }}
                        >
                          {guide.userId?.name || guide.name || "Guide"}
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                        >
                          ⭐ {guide.rating?.toFixed(1) || "New"}
                          {guide.completedTrips > 0
                            ? ` • 🧭 ${guide.completedTrips} trips`
                            : ""}
                          {guide.languages?.length > 0
                            ? ` • 🌐 ${guide.languages.join(", ")}`
                            : ""}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: guide.isAvailable
                            ? T.success + "22"
                            : T.danger + "22",
                          paddingVertical: 4,
                          paddingHorizontal: 10,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: guide.isAvailable ? T.success : T.danger,
                          }}
                        >
                          {guide.isAvailable ? "🟢 Free" : "🔴 Busy"}
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
                      <View>
                        <Text style={{ fontSize: 12, color: T.muted }}>
                          Daily Rate
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: T.text,
                          }}
                        >
                          {guide.dailyRate
                            ? `৳${guide.dailyRate}`
                            : "Negotiable"}
                        </Text>
                      </View>
                      {guide.isAvailable && (
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/(traveller)/booking",
                              params: { guideId: guide._id },
                            })
                          }
                          style={{
                            backgroundColor: T.green,
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                            borderRadius: 14,
                          }}
                        >
                          <Text
                            style={{
                              color: "#022C22",
                              fontSize: 13,
                              fontWeight: "800",
                            }}
                          >
                            Book →
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* ── Highlights Tab ──────────────────────────── */}
          {activeTab === "highlights" && (
            <View style={{ marginBottom: 28 }}>
              {destination.highlights?.length > 0 ? (
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {destination.highlights.map((h, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: T.card,
                        borderRadius: 16,
                        paddingVertical: 14,
                        paddingHorizontal: 18,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        borderWidth: 1,
                        borderColor: T.border,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>📍</Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: T.text,
                        }}
                      >
                        {typeof h === "string" ? h : h.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📍</Text>
                  <Text style={{ color: T.muted, fontSize: 14 }}>
                    No highlights listed yet.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Plan Trip Button ─────────────────────────── */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(traveller)/costplanner",
                params: { destination: destination.name },
              })
            }
            style={{
              backgroundColor: T.green,
              borderRadius: 20,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 100,
            }}
          >
            <Text style={{ fontSize: 22 }}>🧭</Text>
            <Text style={{ color: "#022C22", fontSize: 17, fontWeight: "900" }}>
              Plan This Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
