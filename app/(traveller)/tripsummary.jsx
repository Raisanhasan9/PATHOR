import { useLocalSearchParams, useRouter } from "expo-router";
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

const EXPENSE_META = {
  transport: { emoji: "🚌", label: "Transport" },
  hotel: { emoji: "🏨", label: "Hotel" },
  food: { emoji: "🍛", label: "Food" },
  guide: { emoji: "🧭", label: "Guide" },
  activities: { emoji: "🏄", label: "Activities" },
  misc: { emoji: "🛍️", label: "Misc" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000));
}

export default function TripSummary() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await apiClient.get(`/trips/${id}/summary`);
      if (res.data?.success) {
        setSummary(res.data.data);
      } else {
        throw new Error(res.data?.message || "Failed to load trip summary");
      }
    } catch (err) {
      console.error("TripSummary fetch error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          err.message ||
          "Could not load trip summary.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSummary();
  }, [fetchSummary]);

  const handleSubmitRating = async () => {
    if (!rating || !summary?.booking?._id) return;
    setSubmittingRating(true);
    try {
      await apiClient.post(`/bookings/${summary.booking._id}/review`, {
        rating,
      });
      setRatingDone(true);
      Alert.alert("Thank you!", "Your rating has been submitted.");
    } catch (err) {
      console.error("Rating submit error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not submit rating.",
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleShare = async () => {
    if (!id) return;
    setSharing(true);
    try {
      await apiClient.post(`/trips/${id}/share`);
      setShared(true);
    } catch (err) {
      console.error("Share error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not share trip.",
      );
    } finally {
      setSharing(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
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
          Loading trip summary…
        </Text>
      </View>
    );
  }

  if (!summary) {
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
        <StatusBar style="light" />
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🗺️</Text>
        <Text
          style={{
            color: T.text,
            fontSize: 17,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Summary Not Found
        </Text>
        <Text
          style={{
            color: T.muted,
            fontSize: 13,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          We couldn't load this trip summary. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: T.green,
            paddingHorizontal: 28,
            paddingVertical: 13,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const trip = summary.trip || {};
  const expenses = summary.expenses || {};
  const guide = summary.guide || null;
  const highlights = summary.highlights || [];
  const photos = summary.photos || [];

  const startDate = formatDate(trip.startDate);
  const endDate = formatDate(trip.endDate);
  const days = daysBetween(trip.startDate, trip.endDate);
  const people = trip.people ?? trip.groupSize ?? 1;
  const totalSpent = summary.totalSpent ?? 0;
  const budgetPlanned = summary.budgetPlanned ?? 0;
  const saved = budgetPlanned - totalSpent;
  const savingPercent =
    budgetPlanned > 0 ? Math.round((saved / budgetPlanned) * 100) : 0;

  // Build expense rows from API shape
  const expenseRows = Object.entries(expenses).map(([key, val]) => {
    const meta = EXPENSE_META[key] || { emoji: "💸", label: key };
    const amount =
      typeof val === "object" ? (val.actual ?? val.spent ?? 0) : val;
    const planned = typeof val === "object" ? (val.planned ?? amount) : amount;
    return { ...meta, key, amount, planned };
  });

  // Fallback photo emojis if backend returns strings or none
  const photoEmojis = ["🌊", "🏖️", "🌅", "🐚", "🦀", "🛥️"];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="light" />

      {/* Ambient orbs */}
      <View
        style={{
          position: "absolute",
          top: -60,
          left: -60,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: T.orb,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 180,
          right: -80,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: T.orb,
          opacity: 0.45,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 200,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: T.orb,
          opacity: 0.35,
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
        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: T.green2,
            paddingTop: 56,
            paddingBottom: 40,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignSelf: "flex-start", marginBottom: 20 }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 64, marginBottom: 12 }}>
            {trip.emoji || "🗺️"}
          </Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 4,
            }}
          >
            {trip.destination || trip.destinationName || "Your Trip"}
          </Text>
          <Text style={{ color: "#ffffff99", fontSize: 13, marginBottom: 16 }}>
            {startDate} → {endDate} • {days} day{days !== 1 ? "s" : ""}
          </Text>

          {/* Stats row */}
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            {[
              { label: "People", value: people, emoji: "👥" },
              { label: "Days", value: days, emoji: "📅" },
              {
                label: "Spent",
                value: `৳${(totalSpent / 1000).toFixed(1)}k`,
                emoji: "💰",
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff18",
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>
                  {stat.emoji}
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{ fontSize: 11, color: "#ffffff88", marginTop: 2 }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* ── Trip Info Card ────────────────────────────────────────────── */}
          {(trip.transport || trip.accommodation) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🧳 Trip Details</Text>
              <View style={{ gap: 10 }}>
                {trip.transport && (
                  <View style={styles.row}>
                    <Text style={{ fontSize: 16 }}>🚌</Text>
                    <View>
                      <Text style={styles.detailLabel}>Transport</Text>
                      <Text style={styles.detailValue}>{trip.transport}</Text>
                    </View>
                  </View>
                )}
                {trip.accommodation && (
                  <View style={styles.row}>
                    <Text style={{ fontSize: 16 }}>🏨</Text>
                    <View>
                      <Text style={styles.detailLabel}>Accommodation</Text>
                      <Text style={styles.detailValue}>
                        {trip.accommodation}
                        {trip.accommodationType
                          ? ` • ${trip.accommodationType}`
                          : ""}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Budget Summary ────────────────────────────────────────────── */}
          {expenseRows.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💰 Budget Summary</Text>

              {expenseRows.map((exp) => {
                const overBudget = exp.amount > exp.planned;
                const pct =
                  exp.planned > 0
                    ? Math.min((exp.amount / exp.planned) * 100, 100)
                    : 100;
                return (
                  <View key={exp.key} style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{exp.emoji}</Text>
                        <Text style={{ fontSize: 13, color: T.muted }}>
                          {exp.label}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: overBudget ? T.danger : T.text,
                          }}
                        >
                          ৳{exp.amount.toLocaleString()}
                        </Text>
                        <Text style={{ fontSize: 11, color: T.muted }}>
                          / ৳{exp.planned.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: T.border,
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: 6,
                          width: `${pct}%`,
                          backgroundColor: overBudget ? T.danger : T.success,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                );
              })}

              {/* Total row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: T.border,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: T.text }}
                >
                  Total Spent
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: T.green }}
                >
                  ৳{totalSpent.toLocaleString()}
                </Text>
              </View>

              {saved > 0 && (
                <View
                  style={{
                    backgroundColor: `${T.success}15`,
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🎉</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: T.success,
                      fontWeight: "600",
                      flexShrink: 1,
                    }}
                  >
                    You saved ৳{saved.toLocaleString()} ({savingPercent}% under
                    budget)!
                  </Text>
                </View>
              )}
              {saved < 0 && (
                <View
                  style={{
                    backgroundColor: `${T.danger}15`,
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>⚠️</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: T.danger,
                      fontWeight: "600",
                      flexShrink: 1,
                    }}
                  >
                    Over budget by ৳{Math.abs(saved).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Guide Review ─────────────────────────────────────────────── */}
          {guide && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🧭 Rate Your Guide</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: T.greenSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>🧔</Text>
                </View>
                <View>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: T.text }}
                  >
                    {guide.name || guide.fullName || "Your Guide"}
                  </Text>
                  {guide.rating != null && (
                    <Text style={{ fontSize: 12, color: T.muted }}>
                      Overall rating: ⭐ {Number(guide.rating).toFixed(1)}
                    </Text>
                  )}
                </View>
              </View>

              {ratingDone ? (
                <View
                  style={{
                    backgroundColor: `${T.success}15`,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>✅</Text>
                  <Text
                    style={{
                      color: T.success,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    Rating submitted! Thank you.
                  </Text>
                </View>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                      >
                        <Text style={{ fontSize: 36 }}>
                          {star <= rating ? "⭐" : "☆"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {rating > 0 && (
                    <>
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 13,
                          color: T.success,
                          fontWeight: "600",
                          marginBottom: 12,
                        }}
                      >
                        {rating === 5
                          ? "Excellent! 🎉"
                          : rating === 4
                            ? "Great! 👍"
                            : rating === 3
                              ? "Good 😊"
                              : rating === 2
                                ? "Fair 😐"
                                : "Poor 😔"}
                      </Text>
                      <TouchableOpacity
                        onPress={handleSubmitRating}
                        disabled={submittingRating}
                        style={{
                          backgroundColor: T.green,
                          borderRadius: 14,
                          paddingVertical: 12,
                          alignItems: "center",
                        }}
                      >
                        {submittingRating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "700",
                              fontSize: 14,
                            }}
                          >
                            Submit Rating
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── Trip Highlights ───────────────────────────────────────────── */}
          {highlights.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✨ Trip Highlights</Text>
              <View style={{ gap: 10 }}>
                {highlights.map((h, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{h.emoji || "📌"}</Text>
                    <Text
                      style={{ fontSize: 14, color: T.text, flexShrink: 1 }}
                    >
                      {h.text || h.title || h}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Photo Grid ────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📸 Trip Photos</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(photos.length > 0 ? photos : photoEmojis).map((photo, i) => (
                <View
                  key={i}
                  style={{
                    width: (width - 96) / 3,
                    height: (width - 96) / 3,
                    backgroundColor: T.greenSoft,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  {/* If photo is a URL string, show emoji fallback; real images need <Image> */}
                  <Text style={{ fontSize: 36 }}>
                    {typeof photo === "string" && photo.startsWith("http")
                      ? "🖼️"
                      : (photo.emoji ?? photo)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Action Buttons ────────────────────────────────────────────── */}
          <View style={{ gap: 12, marginBottom: 100 }}>
            <TouchableOpacity
              onPress={handleShare}
              disabled={sharing || shared}
              style={{
                backgroundColor: shared ? T.green2 : T.green,
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                elevation: 4,
                shadowColor: T.green,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                opacity: sharing ? 0.7 : 1,
              }}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={{ fontSize: 20 }}>{shared ? "✅" : "↗️"}</Text>
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  >
                    {shared
                      ? "Shared to Community!"
                      : "Share to Community Feed"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: T.card,
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ fontSize: 20 }}>💾</Text>
              <Text style={{ color: T.text, fontSize: 16, fontWeight: "700" }}>
                Save as PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.border,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: T.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: T.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: T.text,
  },
};
