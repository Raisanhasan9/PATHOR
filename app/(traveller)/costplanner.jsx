import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
  orb: "rgba(5,120,80,0.22)",
  warning: "#F59E0B",
  accent: "#F59E0B",
};

const DESTINATIONS = [
  { name: "Cox's Bazar", distance: 414 },
  { name: "Sundarbans", distance: 320 },
  { name: "Sajek Valley", distance: 310 },
  { name: "Srimangal", distance: 210 },
  { name: "Paharpur", distance: 270 },
  { name: "Ratargul", distance: 240 },
];

const TRANSPORT = [
  { id: "bus", label: "Bus", emoji: "🚌", costPerKm: 1.2 },
  { id: "train", label: "Train", emoji: "🚂", costPerKm: 0.9 },
  { id: "car", label: "Private Car", emoji: "🚗", costPerKm: 3.5 },
  { id: "plane", label: "Flight", emoji: "✈️", costPerKm: 5.0 },
];

const HOTELS = [
  { id: "budget", label: "Budget", emoji: "🏨", perNight: 800 },
  { id: "mid", label: "Mid-range", emoji: "🏩", perNight: 2000 },
  { id: "luxury", label: "Luxury", emoji: "🏰", perNight: 5000 },
];

const FOOD = [
  { id: "local", label: "Local Food", emoji: "🍛", perDay: 300 },
  { id: "mixed", label: "Mixed", emoji: "🍽️", perDay: 600 },
  { id: "restaurant", label: "Restaurant", emoji: "🧆", perDay: 1200 },
];

export default function CostPlanner() {
  const router = useRouter();
  const { destination: paramDest } = useLocalSearchParams();

  const defaultDest =
    DESTINATIONS.find((d) => d.name === paramDest) || DESTINATIONS[0];

  const [destination, setDestination] = useState(defaultDest);
  const [days, setDays] = useState("3");
  const [people, setPeople] = useState("2");
  const [transport, setTransport] = useState("bus");
  const [hotel, setHotel] = useState("mid");
  const [food, setFood] = useState("mixed");
  const [guideIncluded, setGuideIncluded] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-show result if coming from destination screen
  useEffect(() => {
    if (paramDest) setShowResult(false);
  }, []);

  // ── Calculations ──────────────────────────────────────
  const selTransport = TRANSPORT.find((t) => t.id === transport);
  const selHotel = HOTELS.find((h) => h.id === hotel);
  const selFood = FOOD.find((f) => f.id === food);
  const numDays = parseInt(days) || 1;
  const numPeople = parseInt(people) || 1;

  const transportCost =
    selTransport.costPerKm * destination.distance * 2 * numPeople;
  const hotelCost = selHotel.perNight * numDays;
  const foodCost = selFood.perDay * numDays * numPeople;
  const guideCost = guideIncluded ? 1500 * numDays : 0;
  const miscCost = Math.round((transportCost + hotelCost + foodCost) * 0.1);
  const total = transportCost + hotelCost + foodCost + guideCost + miscCost;

  const breakdown = [
    { label: "Transport", emoji: selTransport.emoji, amount: transportCost },
    { label: "Hotel", emoji: selHotel.emoji, amount: hotelCost },
    { label: "Food", emoji: selFood.emoji, amount: foodCost },
    ...(guideIncluded
      ? [{ label: "Guide", emoji: "🧭", amount: guideCost }]
      : []),
    { label: "Miscellaneous", emoji: "🛍️", amount: miscCost },
  ];

  // ── Save trip to backend ──────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post("/trips", {
        destination: destination.name,
        days: numDays,
        numberOfPeople: numPeople,
        transport,
        accommodation: hotel,
        food,
        guideIncluded,
        estimatedBudget: Math.round(total),
        budgetBreakdown: breakdown.map((b) => ({
          category: b.label,
          amount: Math.round(b.amount),
        })),
      });
      setSaved(true);
      Alert.alert(
        "Trip Saved! 🎉",
        `Your ${destination.name} trip plan has been saved. View it in your profile.`,
        [
          {
            text: "View Profile",
            onPress: () => router.push("/(traveller)/profile"),
          },
          { text: "OK" },
        ],
      );
    } catch (err) {
      Alert.alert(
        "Save Failed",
        err.response?.data?.message || "Could not save trip. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setShowResult(false);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="light" />

      {/* Orbs */}
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
        {/* ── Header ───────────────────────────────────── */}
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ color: T.green, fontSize: 15, fontWeight: "700" }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={{ color: T.text, fontSize: 24, fontWeight: "900" }}>
            Cost Planner 💰
          </Text>
          <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
            Plan your trip budget smartly
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── Destination ──────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: T.text3,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            📍 Destination
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {DESTINATIONS.map((d) => (
                <TouchableOpacity
                  key={d.name}
                  onPress={() => {
                    setDestination(d);
                    reset();
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor:
                      destination.name === d.name ? T.green : T.card,
                    borderWidth: 1,
                    borderColor:
                      destination.name === d.name ? T.green : T.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: destination.name === d.name ? "#022C22" : T.text,
                    }}
                  >
                    {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ── Days & People ─────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: T.text3,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                📅 Days
              </Text>
              <TextInput
                value={days}
                onChangeText={(v) => {
                  setDays(v);
                  reset();
                }}
                keyboardType="number-pad"
                style={{
                  backgroundColor: T.card,
                  borderWidth: 1.5,
                  borderColor: T.border,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 18,
                  fontWeight: "800",
                  color: T.text,
                  textAlign: "center",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: T.text3,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                👥 People
              </Text>
              <TextInput
                value={people}
                onChangeText={(v) => {
                  setPeople(v);
                  reset();
                }}
                keyboardType="number-pad"
                style={{
                  backgroundColor: T.card,
                  borderWidth: 1.5,
                  borderColor: T.border,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 18,
                  fontWeight: "800",
                  color: T.text,
                  textAlign: "center",
                }}
              />
            </View>
          </View>

          {/* ── Transport ─────────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: T.text3,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            🚌 Transport
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {TRANSPORT.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => {
                  setTransport(t.id);
                  reset();
                }}
                style={{
                  backgroundColor: transport === t.id ? T.green : T.card,
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1.5,
                  borderColor: transport === t.id ? T.green : T.border,
                  width: (width - 50) / 2,
                }}
              >
                <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: transport === t.id ? "#022C22" : T.text,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Accommodation ─────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: T.text3,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            🏨 Accommodation
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            {HOTELS.map((h) => (
              <TouchableOpacity
                key={h.id}
                onPress={() => {
                  setHotel(h.id);
                  reset();
                }}
                style={{
                  flex: 1,
                  backgroundColor: hotel === h.id ? T.green : T.card,
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: hotel === h.id ? T.green : T.border,
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{h.emoji}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: hotel === h.id ? "#022C22" : T.text,
                    textAlign: "center",
                  }}
                >
                  {h.label}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: hotel === h.id ? "#022C2288" : T.muted,
                    marginTop: 2,
                  }}
                >
                  ৳{h.perNight}/night
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Food ──────────────────────────────────────── */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: T.text3,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            🍛 Food
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            {FOOD.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  setFood(f.id);
                  reset();
                }}
                style={{
                  flex: 1,
                  backgroundColor: food === f.id ? T.green : T.card,
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: food === f.id ? T.green : T.border,
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{f.emoji}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: food === f.id ? "#022C22" : T.text,
                    textAlign: "center",
                  }}
                >
                  {f.label}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: food === f.id ? "#022C2288" : T.muted,
                    marginTop: 2,
                  }}
                >
                  ৳{f.perDay}/day
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Guide Toggle ──────────────────────────────── */}
          <TouchableOpacity
            onPress={() => {
              setGuideIncluded(!guideIncluded);
              reset();
            }}
            style={{
              backgroundColor: guideIncluded ? T.greenSoft : T.card,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              borderWidth: 1.5,
              borderColor: guideIncluded ? T.green : T.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={{ fontSize: 24 }}>🧭</Text>
              <View>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: T.text }}
                >
                  Include Local Guide
                </Text>
                <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  ৳1,500/day — verified & trusted
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: guideIncluded ? T.green : T.border,
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
                  alignSelf: guideIncluded ? "flex-end" : "flex-start",
                }}
              />
            </View>
          </TouchableOpacity>

          {/* ── Calculate Button ──────────────────────────── */}
          <TouchableOpacity
            onPress={() => setShowResult(true)}
            style={{
              backgroundColor: T.green,
              borderRadius: 20,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ color: "#022C22", fontSize: 17, fontWeight: "900" }}>
              Calculate Budget →
            </Text>
          </TouchableOpacity>

          {/* ── Result ────────────────────────────────────── */}
          {showResult && (
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 24,
                padding: 24,
                marginBottom: 100,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: T.text,
                  marginBottom: 4,
                }}
              >
                💡 Estimated Budget
              </Text>
              <Text style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
                {destination.name} • {days} days • {people} people
              </Text>

              {/* Breakdown */}
              <View style={{ gap: 14, marginBottom: 20 }}>
                {breakdown.map((item) => {
                  const pct = Math.round((item.amount / total) * 100);
                  return (
                    <View key={item.label}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                          <Text style={{ fontSize: 14, color: T.muted }}>
                            {item.label}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: T.text,
                          }}
                        >
                          ৳{Math.round(item.amount).toLocaleString()}
                        </Text>
                      </View>
                      {/* Progress bar */}
                      <View
                        style={{
                          height: 4,
                          backgroundColor: T.border,
                          borderRadius: 2,
                        }}
                      >
                        <View
                          style={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: T.green,
                            width: `${pct}%`,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: T.border,
                  marginBottom: 16,
                }}
              />

              {/* Total */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: T.text }}
                >
                  Total Estimate
                </Text>
                <Text
                  style={{ fontSize: 26, fontWeight: "900", color: T.green }}
                >
                  ৳{Math.round(total).toLocaleString()}
                </Text>
              </View>

              {/* Per person */}
              <View
                style={{
                  backgroundColor: T.greenSoft,
                  borderRadius: 14,
                  padding: 14,
                  alignItems: "center",
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <Text
                  style={{ fontSize: 13, color: T.green, fontWeight: "700" }}
                >
                  Per person: ৳{Math.round(total / numPeople).toLocaleString()}
                </Text>
              </View>

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving || saved}
                style={{
                  backgroundColor: saved ? T.green2 : T.green,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#022C22" />
                ) : (
                  <>
                    <Text style={{ fontSize: 18 }}>{saved ? "✅" : "💾"}</Text>
                    <Text
                      style={{
                        color: "#022C22",
                        fontSize: 15,
                        fontWeight: "800",
                      }}
                    >
                      {saved ? "Trip Saved!" : "Save This Plan"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
