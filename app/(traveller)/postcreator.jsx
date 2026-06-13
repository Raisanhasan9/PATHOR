import * as Location from "expo-location";
import { useRouter } from "expo-router";
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
  blue: "#3B82F6",
};

const POST_TYPES = [
  { id: "photo", label: "Photo", emoji: "📸", color: "#3B82F6" },
  { id: "alert", label: "Trail Alert", emoji: "⚠️", color: "#F59E0B" },
  { id: "trip", label: "Trip Story", emoji: "✈️", color: "#10B981" },
  { id: "food", label: "Food Spot", emoji: "🍛", color: "#F97316" },
  { id: "tip", label: "Travel Tip", emoji: "💡", color: "#8B5CF6" },
];

const DESTINATIONS = [
  "Cox's Bazar",
  "Sundarbans",
  "Sajek Valley",
  "Srimangal",
  "Paharpur",
  "Ratargul",
  "Other",
];

const EMOJI_OPTIONS = [
  "🏖️",
  "⛰️",
  "🌿",
  "🍃",
  "🏛️",
  "🚤",
  "🌅",
  "🌊",
  "🛥️",
  "🦁",
  "🐯",
  "🦋",
  "🍛",
  "🍤",
  "🌶️",
  "☕",
  "🎪",
  "🎭",
];

const CHAR_LIMIT = 300;

export default function PostCreator() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [postType, setPostType] = useState("photo");
  const [destination, setDestination] = useState("Cox's Bazar");
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🏖️");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);

  // GPS
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(false);

  const selectedType = POST_TYPES.find((t) => t.id === postType);

  // ── Request GPS on mount ──────────────────────────────
  useEffect(() => {
    requestGPS();
  }, []);

  const requestGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setGpsCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setGpsVerified(true);
    } catch (err) {
      console.error("GPS error:", err.message);
    } finally {
      setGpsLoading(false);
    }
  };

  // ── Submit post ───────────────────────────────────────
  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Empty Post", "Please write something before posting.");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/posts", {
        content: content.trim(),
        tag: postType,
        emoji: selectedEmoji,
        isPublic,
        location: {
          name: destination,
          ...(gpsCoords && {
            coordinates: [gpsCoords.longitude, gpsCoords.latitude],
          }),
        },
      });
      setPosted(true);
      setTimeout(() => router.replace("/(traveller)/feed"), 1500);
    } catch (err) {
      Alert.alert(
        "Post Failed",
        err.response?.data?.message || "Could not publish post. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: T.green, fontSize: 15, fontWeight: "700" }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePost}
              disabled={submitting || posted}
              style={{
                backgroundColor: posted ? T.success : T.green,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 20,
                opacity: submitting ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#022C22" />
              ) : (
                <Text
                  style={{ color: "#022C22", fontSize: 14, fontWeight: "900" }}
                >
                  {posted ? "✅ Posted!" : "Post →"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: T.text,
              fontSize: 22,
              fontWeight: "900",
              marginTop: 8,
            }}
          >
            Create Post ✏️
          </Text>
          <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
            Share your experience with the community
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── Post Type ─────────────────────────────────── */}
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
            Post Type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              {POST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setPostType(type.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: postType === type.id ? type.color : T.card,
                    borderWidth: 1.5,
                    borderColor: postType === type.id ? type.color : T.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{type.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: postType === type.id ? "#fff" : T.text,
                    }}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ── Location ──────────────────────────────────── */}
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
            📍 Location
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {DESTINATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDestination(d)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: destination === d ? T.green : T.card,
                    borderWidth: 1,
                    borderColor: destination === d ? T.green : T.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: destination === d ? "#022C22" : T.text,
                    }}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* GPS Badge */}
          <View
            style={{
              backgroundColor: gpsVerified
                ? T.success + "15"
                : T.warning + "15",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: gpsVerified ? T.success + "44" : T.warning + "44",
            }}
          >
            <Text style={{ fontSize: 20 }}>
              {gpsLoading ? "🔄" : gpsVerified ? "📍" : "⚠️"}
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: gpsVerified ? T.success : T.warning,
                }}
              >
                {gpsLoading
                  ? "Getting GPS..."
                  : gpsVerified
                    ? "GPS Verified ✅"
                    : "GPS Not Available"}
              </Text>
              <Text style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
                {gpsVerified
                  ? `Coordinates captured • ${destination}`
                  : "Enable location for GPS verification"}
              </Text>
            </View>
            {!gpsVerified && !gpsLoading && (
              <TouchableOpacity
                onPress={requestGPS}
                style={{
                  backgroundColor: T.warning,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Emoji Picker ──────────────────────────────── */}
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
            Pick Cover Emoji
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 24,
              backgroundColor: T.card,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => setSelectedEmoji(emoji)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    selectedEmoji === emoji ? T.greenSoft : "transparent",
                  borderWidth: selectedEmoji === emoji ? 2 : 1,
                  borderColor: selectedEmoji === emoji ? T.green : T.border,
                }}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Preview ───────────────────────────────────── */}
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
            Preview
          </Text>
          <View
            style={{
              backgroundColor: T.card,
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: T.border,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: T.greenSoft,
                  borderWidth: 1,
                  borderColor: T.border2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: T.text }}
                >
                  {user?.name || "You"}
                </Text>
                <Text style={{ fontSize: 11, color: T.muted }}>
                  📍 {destination} • Just now
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: selectedType.color + "22",
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: selectedType.color,
                  }}
                >
                  {selectedType.emoji} {selectedType.label}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: T.greenSoft,
                paddingVertical: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 52 }}>{selectedEmoji}</Text>
            </View>

            <View style={{ padding: 14 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: content ? T.text : T.muted,
                  lineHeight: 20,
                }}
              >
                {content || "Your post content will appear here..."}
              </Text>
            </View>
          </View>

          {/* ── Content Input ─────────────────────────────── */}
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
            Write Your Post
          </Text>
          <View
            style={{
              backgroundColor: T.card,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: T.border,
              marginBottom: 8,
              overflow: "hidden",
            }}
          >
            <TextInput
              value={content}
              onChangeText={(v) => {
                if (v.length <= CHAR_LIMIT) setContent(v);
              }}
              placeholder={
                postType === "alert"
                  ? "Describe the trail condition or hazard..."
                  : postType === "food"
                    ? "Tell us about this food spot..."
                    : postType === "tip"
                      ? "Share a helpful travel tip..."
                      : "Share your experience..."
              }
              placeholderTextColor={T.muted}
              multiline
              numberOfLines={5}
              style={{
                padding: 16,
                fontSize: 14,
                color: T.text,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              textAlign: "right",
              marginBottom: 24,
              color: content.length > CHAR_LIMIT * 0.9 ? T.danger : T.muted,
            }}
          >
            {content.length}/{CHAR_LIMIT}
          </Text>

          {/* ── Visibility Toggle ─────────────────────────── */}
          <TouchableOpacity
            onPress={() => setIsPublic(!isPublic)}
            style={{
              backgroundColor: T.card,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={{ fontSize: 22 }}>{isPublic ? "🌐" : "🔒"}</Text>
              <View>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: T.text }}
                >
                  {isPublic ? "Public Post" : "Private Post"}
                </Text>
                <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  {isPublic
                    ? "Visible to all community members"
                    : "Only visible to you"}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: isPublic ? T.green : T.border,
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
                  alignSelf: isPublic ? "flex-end" : "flex-start",
                }}
              />
            </View>
          </TouchableOpacity>

          {/* ── Publish Button ────────────────────────────── */}
          <TouchableOpacity
            onPress={handlePost}
            disabled={submitting || posted}
            style={{
              backgroundColor: posted ? T.success : T.green,
              borderRadius: 20,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 100,
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#022C22" />
            ) : (
              <>
                <Text style={{ fontSize: 20 }}>{posted ? "✅" : "✏️"}</Text>
                <Text
                  style={{ color: "#022C22", fontSize: 17, fontWeight: "900" }}
                >
                  {posted ? "Posted to Community!" : "Publish Post →"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
