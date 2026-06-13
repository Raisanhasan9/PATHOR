import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  blue: "#3B82F6",
};

const TAG_COLORS = {
  photo: { bg: "#3B82F622", text: "#3B82F6" },
  alert: { bg: "#F59E0B22", text: "#F59E0B" },
  trip: { bg: "#10B98122", text: "#10B981" },
  food: { bg: "#F59E0B22", text: "#F59E0B" },
  tip: { bg: "#8B5CF622", text: "#8B5CF6" },
};

const FILTERS = ["All", "photo", "alert", "trip", "food", "tip"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Feed() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  // ── Fetch posts ───────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const params = {};
      if (activeFilter !== "All") params.tag = activeFilter;

      const res = await apiClient.get("/posts", { params });
      const fetched = res.data.data || [];
      setPosts(fetched);

      // Seed like counts from API
      const counts = {};
      const liked = {};
      fetched.forEach((p) => {
        counts[p._id] = p.likeCount || p.likes?.length || 0;
        liked[p._id] = p.likes?.includes(user?._id) || false;
      });
      setLikeCounts(counts);
      setLikedPosts(liked);
    } catch (err) {
      console.error("Feed fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [activeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // ── Like / Unlike ─────────────────────────────────────
  const toggleLike = async (postId) => {
    const wasLiked = likedPosts[postId];

    // Optimistic update
    setLikedPosts((prev) => ({ ...prev, [postId]: !wasLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: wasLiked ? prev[postId] - 1 : prev[postId] + 1,
    }));

    try {
      await apiClient.post(`/posts/${postId}/like`);
    } catch (err) {
      // Revert on failure
      setLikedPosts((prev) => ({ ...prev, [postId]: wasLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: wasLiked ? prev[postId] + 1 : prev[postId] - 1,
      }));
      console.error("Like error:", err.response?.data || err.message);
    }
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

      {/* ── Header ─────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: "rgba(16,185,129,0.12)",
          borderWidth: 1,
          borderColor: T.border2,
          paddingTop: 56,
          paddingBottom: 20,
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
              Community 📸
            </Text>
            <Text style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>
              GPS-verified posts from travellers
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(traveller)/post-creator")}
            style={{
              backgroundColor: T.green,
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>✏️</Text>
            <Text style={{ color: "#022C22", fontSize: 13, fontWeight: "800" }}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={{
                  paddingVertical: 7,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: activeFilter === f ? T.green : T.greenSoft,
                  borderWidth: 1,
                  borderColor: activeFilter === f ? T.green : T.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: activeFilter === f ? "#022C22" : T.text,
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── Posts ──────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.green}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 100,
          gap: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={T.green}
            style={{ marginTop: 40 }}
          />
        ) : posts.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📸</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: T.text }}>
              No posts yet
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: T.muted,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Be the first to share your travel experience!
            </Text>
          </View>
        ) : (
          posts.map((post) => {
            const tagKey = post.tag?.toLowerCase();
            const tagStyle = TAG_COLORS[tagKey] || {
              bg: T.greenSoft,
              text: T.green,
            };
            const isLiked = likedPosts[post._id];
            const likeCount = likeCounts[post._id] ?? 0;

            return (
              <View
                key={post._id}
                style={{
                  backgroundColor: T.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: T.border,
                  overflow: "hidden",
                }}
              >
                {/* Post Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    paddingBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: T.greenSoft,
                      borderWidth: 1,
                      borderColor: T.border2,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>
                      {post.userId?.avatar || "👤"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: T.text,
                        }}
                      >
                        {post.userId?.name || "Traveller"}
                      </Text>
                      {post.isVerified && (
                        <Text style={{ fontSize: 13 }}>✅</Text>
                      )}
                    </View>
                    <Text
                      style={{ fontSize: 12, color: T.muted, marginTop: 1 }}
                    >
                      {post.location?.name ? `📍 ${post.location.name} • ` : ""}
                      {post.createdAt ? timeAgo(post.createdAt) : ""}
                    </Text>
                  </View>
                  {post.tag && (
                    <View
                      style={{
                        backgroundColor: tagStyle.bg,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: tagStyle.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {post.tag}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Emoji Banner */}
                <View
                  style={{
                    backgroundColor: T.greenSoft,
                    paddingVertical: 20,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 52 }}>
                    {tagKey === "beach"
                      ? "🏖️"
                      : tagKey === "alert"
                        ? "⚠️"
                        : tagKey === "food"
                          ? "🍽️"
                          : tagKey === "trip"
                            ? "🧳"
                            : "📸"}
                  </Text>
                </View>

                {/* Content */}
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: T.text,
                      lineHeight: 22,
                      marginBottom: 14,
                    }}
                  >
                    {post.content}
                  </Text>

                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 20,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: T.border,
                    }}
                  >
                    {/* Like */}
                    <TouchableOpacity
                      onPress={() => toggleLike(post._id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {isLiked ? "❤️" : "🤍"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: isLiked ? T.danger : T.muted,
                        }}
                      >
                        {likeCount}
                      </Text>
                    </TouchableOpacity>

                    {/* Comments */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>💬</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: T.muted,
                        }}
                      >
                        {post.commentCount || post.comments?.length || 0}
                      </Text>
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>↗️</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: T.muted,
                        }}
                      >
                        Share
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }} />
                    <TouchableOpacity>
                      <Text style={{ fontSize: 20 }}>🔖</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Bottom Nav ─────────────────────────────────── */}
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
                fontWeight: tab.label === "Feed" ? "800" : "600",
                color: tab.label === "Feed" ? T.green : T.muted,
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
