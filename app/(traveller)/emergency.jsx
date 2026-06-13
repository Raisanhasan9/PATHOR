import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Linking,
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
  danger: "#EF4444",
  warning: "#F59E0B",
  blue: "#3B82F6",
};

// Static — these never change
const EMERGENCY_CONTACTS = [
  {
    id: 1,
    name: "National Emergency",
    number: "999",
    emoji: "🚨",
    color: "#EF4444",
    description: "Police, Fire, Ambulance",
  },
  {
    id: 2,
    name: "Tourist Police",
    number: "01769-690999",
    emoji: "👮",
    color: "#3B82F6",
    description: "24/7 tourist assistance",
  },
  {
    id: 3,
    name: "Ambulance",
    number: "199",
    emoji: "🚑",
    color: "#EF4444",
    description: "Medical emergency",
  },
  {
    id: 4,
    name: "Fire Service",
    number: "102",
    emoji: "🚒",
    color: "#F97316",
    description: "Fire & rescue",
  },
  {
    id: 5,
    name: "Coast Guard",
    number: "01769-615261",
    emoji: "⛵",
    color: "#0EA5E9",
    description: "Sea & river emergencies",
  },
  {
    id: 6,
    name: "RAB Hotline",
    number: "01769-000000",
    emoji: "🛡️",
    color: "#6366F1",
    description: "Rapid action battalion",
  },
];

const SAFETY_TIPS = [
  {
    id: 1,
    tip: "Always share your live location with a trusted contact before starting a trip.",
    emoji: "📍",
  },
  {
    id: 2,
    tip: "Keep your phone charged and carry a power bank on long trips.",
    emoji: "🔋",
  },
  {
    id: 3,
    tip: "Register your trip with a local guide for remote destinations like Sundarbans.",
    emoji: "🧭",
  },
  {
    id: 4,
    tip: "Check live weather and curfew alerts before entering hill districts.",
    emoji: "⛈️",
  },
  {
    id: 5,
    tip: "Carry a basic first aid kit on all outdoor trips.",
    emoji: "🩹",
  },
];

const alertColor = (severity) => {
  if (severity === "high") return "#EF4444";
  if (severity === "medium") return "#F59E0B";
  return "#10B981";
};

export default function Emergency() {
  const router = useRouter();

  const [alerts, setAlerts] = useState([]);
  const [sosPressed, setSosPressed] = useState(false);

  // ── Fetch live alerts ─────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get("/alerts");
        setAlerts(res.data.data || []);
      } catch (err) {
        console.error("Alerts fetch error:", err.response?.data || err.message);
      }
    };
    fetch();
  }, []);

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSOS = () => {
    setSosPressed(true);
    setTimeout(() => setSosPressed(false), 3000);
    Linking.openURL("tel:999");
  };

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
        {/* ── Header ─────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: T.danger + "22",
            borderWidth: 1,
            borderColor: T.danger + "44",
            paddingTop: 56,
            paddingBottom: 32,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 56, left: 24 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: T.green, fontSize: 15, fontWeight: "700" }}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 48, marginBottom: 8 }}>🆘</Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: T.text,
              marginBottom: 4,
            }}
          >
            Emergency Help
          </Text>
          <Text style={{ fontSize: 13, color: T.muted, textAlign: "center" }}>
            Stay calm. Help is one tap away.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── SOS Button ───────────────────────────────── */}
          <TouchableOpacity
            onPress={handleSOS}
            style={{
              backgroundColor: sosPressed ? "#7f0000" : T.danger,
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              marginBottom: 24,
              borderWidth: 4,
              borderColor: sosPressed ? "#ff000044" : "#ff000022",
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 8 }}>
              {sosPressed ? "📡" : "🆘"}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: 2,
              }}
            >
              {sosPressed ? "CALLING 999..." : "TAP FOR SOS"}
            </Text>
            <Text style={{ color: "#ffffff88", fontSize: 12, marginTop: 4 }}>
              {sosPressed
                ? "Connecting to emergency services"
                : "Instantly calls national emergency (999)"}
            </Text>
          </TouchableOpacity>

          {/* ── Location Share ───────────────────────────── */}
          <View
            style={{
              backgroundColor: T.blue + "18",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              borderLeftWidth: 4,
              borderLeftColor: T.blue,
            }}
          >
            <Text style={{ fontSize: 28 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: T.text,
                  marginBottom: 2,
                }}
              >
                Share Your Location
              </Text>
              <Text style={{ fontSize: 12, color: T.muted }}>
                Let emergency contacts know where you are
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://maps.google.com")}
              style={{
                backgroundColor: T.blue,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Live Alerts from API ─────────────────────── */}
          {alerts.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: T.text,
                  marginBottom: 12,
                }}
              >
                🚨 Active Travel Alerts
              </Text>
              <View style={{ gap: 10 }}>
                {alerts.map((alert) => (
                  <View
                    key={alert._id}
                    style={{
                      backgroundColor: alertColor(alert.severity) + "18",
                      borderRadius: 14,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: alertColor(alert.severity),
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>
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
                    <View
                      style={{
                        backgroundColor: alertColor(alert.severity) + "22",
                        paddingVertical: 3,
                        paddingHorizontal: 8,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: alertColor(alert.severity),
                          textTransform: "uppercase",
                        }}
                      >
                        {alert.severity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Emergency Contacts ───────────────────────── */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: T.text,
              marginBottom: 12,
            }}
          >
            📞 Emergency Contacts
          </Text>
          <View style={{ gap: 10, marginBottom: 24 }}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => handleCall(contact.number)}
                style={{
                  backgroundColor: T.card,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: contact.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{contact.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: T.text }}
                  >
                    {contact.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {contact.description}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: contact.color,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>📞</Text>
                  <Text
                    style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                  >
                    {contact.number}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Safety Tips ──────────────────────────────── */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: T.text,
              marginBottom: 12,
            }}
          >
            🛡️ Safety Tips
          </Text>
          <View style={{ gap: 10, marginBottom: 100 }}>
            {SAFETY_TIPS.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: T.card,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: T.text,
                    lineHeight: 20,
                  }}
                >
                  {item.tip}
                </Text>
              </View>
            ))}
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
