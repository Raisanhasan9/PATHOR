import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
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

const PAYMENT_METHODS = [
  { id: "bkash", label: "bKash", emoji: "📲", color: "#E31C79" },
  { id: "nagad", label: "Nagad", emoji: "💳", color: "#F97316" },
  { id: "cash", label: "Cash", emoji: "💵", color: "#10B981" },
];

// Generate next 7 available dates
const generateDates = () => {
  const dates = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    dates.push({
      date: `${months[d.getMonth()]} ${d.getDate()}`,
      day: days[d.getDay()],
      iso: d.toISOString(),
    });
  }
  return dates;
};

const DATES = generateDates();

export default function Booking() {
  const router = useRouter();
  const { guideId } = useLocalSearchParams();

  const [guide, setGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [days, setDays] = useState("2");
  const [people, setPeople] = useState("2");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [note, setNote] = useState("");
  const [bookingType, setBookingType] = useState("advance");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // ── Fetch guide info ──────────────────────────────────
  useEffect(() => {
    if (!guideId) {
      setLoadingGuide(false);
      return;
    }
    const fetch = async () => {
      try {
        const res = await apiClient.get(`/guides/${guideId}`);
        setGuide(res.data.data);
      } catch (err) {
        console.error("Guide fetch error:", err.response?.data || err.message);
      } finally {
        setLoadingGuide(false);
      }
    };
    fetch();
  }, [guideId]);

  const pricePerDay = guide?.dailyRate || 1500;
  const numDays = parseInt(days) || 1;
  const subtotal = pricePerDay * numDays;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  // ── Submit booking ────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedDate) {
      Alert.alert("Select Date", "Please select a start date.");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/bookings", {
        guideId,
        startDate: selectedDate.iso,
        days: numDays,
        numberOfPeople: parseInt(people) || 1,
        bookingType,
        paymentMethod,
        note: note.trim() || undefined,
        totalAmount: total,
      });
      setConfirmed(true);
      setTimeout(() => router.replace("/(traveller)/home"), 2500);
    } catch (err) {
      Alert.alert(
        "Booking Failed",
        err.response?.data?.message || "Could not complete booking. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmed screen ──────────────────────────────────
  if (confirmed) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
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
        <Text style={{ fontSize: 80, marginBottom: 24 }}>🎉</Text>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: T.green,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Booking Confirmed!
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: T.muted,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 8,
          }}
        >
          {guide?.userId?.name || "Your guide"} has been notified. You'll
          receive a confirmation shortly.
        </Text>
        <Text style={{ fontSize: 13, color: T.muted }}>
          Redirecting to home...
        </Text>
      </View>
    );
  }

  if (loadingGuide) {
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
            paddingBottom: 24,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <TouchableOpacity
            onPress={() => (step === 1 ? router.back() : setStep(1))}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ color: T.green, fontSize: 15, fontWeight: "700" }}>
              ← {step === 1 ? "Back" : "Change Details"}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: "900" }}>
            {step === 1 ? "Book Guide 📅" : "Payment 💳"}
          </Text>
          <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
            {guide?.userId?.name || "Guide"} •{" "}
            {guide?.destinations?.[0] || "Bangladesh"}
          </Text>

          {/* Step bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
              gap: 8,
            }}
          >
            {[1, 2].map((s) => (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: s <= step ? T.green : T.border,
                }}
              />
            ))}
          </View>
          <Text style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>
            Step {step} of 2
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── STEP 1 ───────────────────────────────────── */}
          {step === 1 && (
            <>
              {/* Booking Type */}
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
                Booking Type
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                {[
                  {
                    id: "advance",
                    label: "Advance",
                    emoji: "📋",
                    desc: "Plan ahead",
                  },
                  {
                    id: "instant",
                    label: "Instant",
                    emoji: "⚡",
                    desc: "Book now",
                  },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setBookingType(type.id)}
                    style={{
                      flex: 1,
                      backgroundColor:
                        bookingType === type.id ? T.green : T.card,
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: bookingType === type.id ? T.green : T.border,
                    }}
                  >
                    <Text style={{ fontSize: 26, marginBottom: 6 }}>
                      {type.emoji}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: bookingType === type.id ? "#022C22" : T.text,
                      }}
                    >
                      {type.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: bookingType === type.id ? "#022C2288" : T.muted,
                        marginTop: 2,
                      }}
                    >
                      {type.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date picker */}
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
                📅 Select Start Date
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 24 }}
              >
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {DATES.map((slot) => (
                    <TouchableOpacity
                      key={slot.date}
                      onPress={() => setSelectedDate(slot)}
                      style={{
                        width: 70,
                        backgroundColor:
                          selectedDate?.date === slot.date ? T.green : T.card,
                        borderRadius: 16,
                        padding: 12,
                        alignItems: "center",
                        borderWidth: 1.5,
                        borderColor:
                          selectedDate?.date === slot.date ? T.green : T.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color:
                            selectedDate?.date === slot.date
                              ? "#022C2288"
                              : T.muted,
                          marginBottom: 4,
                        }}
                      >
                        {slot.day}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color:
                            selectedDate?.date === slot.date
                              ? "#022C22"
                              : T.text,
                        }}
                      >
                        {slot.date}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Days & People */}
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
                    Duration (days)
                  </Text>
                  <TextInput
                    value={days}
                    onChangeText={setDays}
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
                    onChangeText={setPeople}
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

              {/* Note */}
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
                📝 Note to Guide (optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Any special requests or requirements..."
                placeholderTextColor={T.muted}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: T.card,
                  borderWidth: 1.5,
                  borderColor: T.border,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 14,
                  color: T.text,
                  marginBottom: 24,
                  minHeight: 90,
                  textAlignVertical: "top",
                }}
              />

              {/* Price preview */}
              <View
                style={{
                  backgroundColor: T.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, color: T.muted }}>
                    ৳{pricePerDay.toLocaleString()} × {numDays} days
                  </Text>
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: T.text }}
                  >
                    ৳{subtotal.toLocaleString()}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 13, color: T.muted }}>
                    Platform fee (5%)
                  </Text>
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: T.text }}
                  >
                    ৳{platformFee}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: T.border,
                  }}
                >
                  <Text
                    style={{ fontSize: 15, fontWeight: "800", color: T.text }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{ fontSize: 18, fontWeight: "900", color: T.green }}
                  >
                    ৳{total.toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setStep(2)}
                style={{
                  backgroundColor: T.green,
                  borderRadius: 20,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 100,
                }}
              >
                <Text
                  style={{ color: "#022C22", fontSize: 17, fontWeight: "900" }}
                >
                  Continue to Payment →
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2 ───────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Summary */}
              <View
                style={{
                  backgroundColor: T.greenSoft,
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: T.border2,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: T.green,
                    marginBottom: 12,
                    letterSpacing: 1,
                  }}
                >
                  BOOKING SUMMARY
                </Text>
                {[
                  { label: "Guide", value: guide?.userId?.name || "Guide" },
                  { label: "Date", value: selectedDate?.date || "—" },
                  { label: "Duration", value: `${numDays} days` },
                  { label: "People", value: people },
                  {
                    label: "Type",
                    value:
                      bookingType === "advance" ? "📋 Advance" : "⚡ Instant",
                  },
                ].map((item) => (
                  <View
                    key={item.label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: T.muted }}>
                      {item.label}
                    </Text>
                    <Text
                      style={{ fontSize: 13, fontWeight: "600", color: T.text }}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: T.border,
                    marginTop: 6,
                  }}
                >
                  <Text
                    style={{ fontSize: 14, fontWeight: "800", color: T.green }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{ fontSize: 18, fontWeight: "900", color: T.green }}
                  >
                    ৳{total.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Payment Method */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: T.text3,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                💳 Payment Method
              </Text>
              <View style={{ gap: 10, marginBottom: 28 }}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setPaymentMethod(method.id)}
                    style={{
                      backgroundColor:
                        paymentMethod === method.id
                          ? method.color + "18"
                          : T.card,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor:
                        paymentMethod === method.id ? method.color : T.border,
                    }}
                  >
                    <Text style={{ fontSize: 28, marginRight: 14 }}>
                      {method.emoji}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: "700",
                        color: T.text,
                      }}
                    >
                      {method.label}
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor:
                          paymentMethod === method.id ? method.color : T.border,
                        backgroundColor:
                          paymentMethod === method.id
                            ? method.color
                            : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {paymentMethod === method.id && (
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Confirm */}
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={submitting}
                style={{
                  backgroundColor: T.success,
                  borderRadius: 20,
                  paddingVertical: 18,
                  alignItems: "center",
                  marginBottom: 100,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={{ fontSize: 22 }}>✅</Text>
                    <Text
                      style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}
                    >
                      Confirm Booking • ৳{total.toLocaleString()}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
