import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";

const { width } = Dimensions.get("window");

const guide = {
  name: "Alam Hossain",
  avatar: "🧔",
  location: "Cox's Bazar",
  rating: 4.9,
  totalTrips: 142,
  trustScore: 96,
  price: "৳1,500/day",
  languages: ["Bengali", "English"],
  specialties: ["Beach Tours", "Sea Fishing", "Night Markets", "Marine Drive"],
  about:
    "I have been guiding travellers across Cox's Bazar for over 8 years. I know every hidden gem, the best local food spots, and how to keep you safe while having the best time of your life.",
  verified: true,
  available: true,
  responseTime: "Usually replies in 30 min",
  completionRate: 98,
};

const reviews = [
  {
    id: 1,
    user: "Rafiq Hasan",
    avatar: "👨",
    rating: 5,
    date: "May 2026",
    comment:
      "Alam bhai is the best guide in Cox's Bazar! He took us to places we never would have found ourselves.",
  },
  {
    id: 2,
    user: "Sumaiya Akter",
    avatar: "👩",
    rating: 5,
    date: "Apr 2026",
    comment:
      "Very professional and friendly. Spoke excellent English and knew all the best spots.",
  },
  {
    id: 3,
    user: "Karim Uddin",
    avatar: "🧔",
    rating: 4,
    date: "Mar 2026",
    comment:
      "Great experience overall. Very knowledgeable about local culture and history.",
  },
];

const availability = [
  { date: "Jun 1", day: "Mon", free: true },
  { date: "Jun 2", day: "Tue", free: true },
  { date: "Jun 3", day: "Wed", free: false },
  { date: "Jun 4", day: "Thu", free: false },
  { date: "Jun 5", day: "Fri", free: true },
  { date: "Jun 6", day: "Sat", free: true },
  { date: "Jun 7", day: "Sun", free: true },
];

export default function GuideProfile() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 56,
            paddingBottom: 40,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSaved(!saved)}>
              <Text style={{ fontSize: 24 }}>{saved ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: "#ffffff22",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              borderWidth: 3,
              borderColor: "#ffffff44",
            }}
          >
            <Text style={{ fontSize: 52 }}>{guide.avatar}</Text>
          </View>

          {/* Verified Badge */}
          {guide.verified && (
            <View
              style={{
                backgroundColor: Colors.success + "33",
                borderRadius: 20,
                paddingVertical: 4,
                paddingHorizontal: 12,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 12 }}>✅</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontWeight: "700",
                }}
              >
                Verified Guide
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 4,
            }}
          >
            {guide.name}
          </Text>
          <Text style={{ color: "#ffffff99", fontSize: 13, marginBottom: 16 }}>
            📍 {guide.location}
          </Text>

          {/* Stats Row */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              width: "100%",
            }}
          >
            {[
              { label: "Rating", value: guide.rating, emoji: "⭐" },
              { label: "Trips", value: guide.totalTrips, emoji: "🧭" },
              { label: "Trust", value: `${guide.trustScore}%`, emoji: "🛡️" },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff18",
                  borderRadius: 16,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, marginBottom: 4 }}>
                  {stat.emoji}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#fff",
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#ffffff88",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Availability + Price */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: guide.available
                  ? Colors.success + "15"
                  : Colors.danger + "15",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: guide.available
                  ? Colors.success + "44"
                  : Colors.danger + "44",
              }}
            >
              <Text style={{ fontSize: 20, marginBottom: 4 }}>
                {guide.available ? "🟢" : "🔴"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: guide.available ? Colors.success : Colors.danger,
                }}
              >
                {guide.available ? "Available" : "Busy"}
              </Text>
              <Text
                style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}
              >
                {guide.responseTime}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.primary + "15",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: Colors.primary + "44",
              }}
            >
              <Text style={{ fontSize: 20, marginBottom: 4 }}>💰</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: Colors.primary,
                }}
              >
                {guide.price}
              </Text>
              <Text
                style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}
              >
                Completion: {guide.completionRate}%
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: Colors.card,
              borderRadius: 16,
              padding: 4,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            {["about", "availability", "reviews"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 13,
                  alignItems: "center",
                  backgroundColor:
                    activeTab === tab ? Colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 11,
                    color: activeTab === tab ? "#fff" : Colors.textMuted,
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "about"
                    ? "👤 About"
                    : tab === "availability"
                      ? "📅 Calendar"
                      : "⭐ Reviews"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* About Tab */}
          {activeTab === "about" && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textMuted,
                  lineHeight: 24,
                  marginBottom: 16,
                }}
              >
                {guide.about}
              </Text>

              {/* Languages */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: Colors.text,
                  marginBottom: 8,
                }}
              >
                🌐 Languages
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {guide.languages.map((lang) => (
                  <View
                    key={lang}
                    style={{
                      backgroundColor: Colors.primary + "15",
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: Colors.primary,
                        fontWeight: "600",
                      }}
                    >
                      {lang}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Specialties */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: Colors.text,
                  marginBottom: 8,
                }}
              >
                🎯 Specialties
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {guide.specialties.map((spec) => (
                  <View
                    key={spec}
                    style={{
                      backgroundColor: Colors.card,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: Colors.text,
                        fontWeight: "600",
                      }}
                    >
                      {spec}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.textMuted,
                  marginBottom: 14,
                }}
              >
                Available dates for June 2026
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {availability.map((slot) => (
                  <View
                    key={slot.date}
                    style={{
                      width: (width - 72) / 4,
                      backgroundColor: slot.free
                        ? Colors.success + "15"
                        : Colors.danger + "15",
                      borderRadius: 14,
                      padding: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: slot.free
                        ? Colors.success + "44"
                        : Colors.danger + "44",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: Colors.textMuted,
                        marginBottom: 4,
                      }}
                    >
                      {slot.day}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: slot.free ? Colors.success : Colors.danger,
                      }}
                    >
                      {slot.date}
                    </Text>
                    <Text style={{ fontSize: 14, marginTop: 4 }}>
                      {slot.free ? "✅" : "❌"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <View style={{ gap: 12, marginBottom: 24 }}>
              {reviews.map((review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: Colors.card,
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: Colors.primary + "15",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{review.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: Colors.text,
                        }}
                      >
                        {review.user}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: Colors.textMuted,
                          marginTop: 1,
                        }}
                      >
                        {review.date}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: Colors.accent,
                        fontWeight: "700",
                      }}
                    >
                      {"⭐".repeat(review.rating)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: Colors.textMuted,
                      lineHeight: 20,
                    }}
                  >
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Book Button */}
          <TouchableOpacity
            onPress={() => router.push("/(traveller)/booking")}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: "center",
              marginBottom: 100,
              elevation: 6,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 22 }}>📅</Text>
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>
              Book Alam Hossain
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
