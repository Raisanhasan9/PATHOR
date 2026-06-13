import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
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

const { width } = Dimensions.get("window");

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateStr = msg.createdAt
      ? new Date(msg.createdAt).toDateString()
      : null;
    if (dateStr && dateStr !== lastDate) {
      groups.push({
        type: "divider",
        id: `div-${dateStr}`,
        date: msg.createdAt,
      });
      lastDate = dateStr;
    }
    groups.push({ type: "message", ...msg });
  });
  return groups;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ item, myId }) {
  const isMine = item.senderId === myId || item.sender === myId;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isMine ? 16 : -16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (item.type === "divider") {
    return (
      <View style={styles.dateDivider}>
        <View style={styles.dateDividerLine} />
        <Text style={styles.dateDividerText}>
          {formatDateDivider(item.date)}
        </Text>
        <View style={styles.dateDividerLine} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
        ]}
      >
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
          {item.content || item.message || item.text || ""}
        </Text>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
            {formatTime(item.createdAt)}
          </Text>
          {isMine && (
            <Text style={styles.readTick}>{item.read ? "✓✓" : "✓"}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function TravellerMessaging() {
  const router = useRouter();
  const { bookingId, guideName, guideId } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const orbAnim = useRef(new Animated.Value(0)).current;

  // Orb breathing
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const orbScale = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const orbOpacity = orbAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.45, 0.7, 0.45],
  });

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = async (silent = false) => {
    if (!bookingId) {
      setError("No booking ID provided.");
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/messages/${bookingId}`);
      if (res.data.success) {
        const msgs = res.data.data || [];
        setMessages(msgs);
        setGrouped(groupByDate(msgs));
      } else {
        setError(res.data.message || "Failed to load messages.");
      }
    } catch (err) {
      console.error("fetchMessages error:", err);
      setError("Could not load messages. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 8s for new messages
    const interval = setInterval(() => fetchMessages(true), 8000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Scroll to bottom when grouped list updates
  useEffect(() => {
    if (grouped.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [grouped.length]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    // Optimistic update
    const optimistic = {
      _id: `opt-${Date.now()}`,
      bookingId,
      senderId: user?._id || user?.id,
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
      _optimistic: true,
    };
    const newMsgs = [...messages, optimistic];
    setMessages(newMsgs);
    setGrouped(groupByDate(newMsgs));
    setInputText("");
    setSending(true);

    try {
      const res = await apiClient.post("/messages", {
        bookingId,
        content: text,
        receiverId: guideId,
      });
      if (res.data.success) {
        // Replace optimistic with real message
        await fetchMessages(true);
      } else {
        Alert.alert(
          "Send failed",
          res.data.message || "Could not send message.",
        );
        // Rollback optimistic
        setMessages(messages);
        setGrouped(groupByDate(messages));
        setInputText(text);
      }
    } catch (err) {
      console.error("handleSend error:", err);
      Alert.alert("Error", "Message not sent. Please try again.");
      setMessages(messages);
      setGrouped(groupByDate(messages));
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages(true);
  };

  const myId = user?._id || user?.id;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* Ambient orbs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            styles.orb,
            styles.orbTop,
            { transform: [{ scale: orbScale }], opacity: orbOpacity },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🧭</Text>
            </View>
            <View>
              <Text style={styles.headerName} numberOfLines={1}>
                {guideName || "Guide"}
              </Text>
              <Text style={styles.headerSub}>
                Booking #{String(bookingId).slice(-6)}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* ── Message list ── */}
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={T.green} />
            <Text style={styles.stateText}>Loading messages…</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => fetchMessages()} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.centeredState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.stateTitle}>No messages yet</Text>
            <Text style={styles.stateText}>
              Send a message to start the conversation with your guide.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={grouped}
            keyExtractor={(item) => item._id || item.id || item.id}
            renderItem={({ item }) => <Bubble item={item} myId={myId} />}
            contentContainerStyle={styles.messageList}
            onRefresh={onRefresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={T.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            returnKeyType="default"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              (!inputText.trim() || sending) && styles.sendBtnDisabled,
              pressed && inputText.trim() && styles.sendBtnPressed,
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendBtnIcon}>➤</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  flex: { flex: 1 },

  // Orb
  orb: { position: "absolute", borderRadius: 999 },
  orbTop: {
    width: width * 1.1,
    height: width * 1.1,
    top: -width * 0.6,
    left: -width * 0.05,
    backgroundColor: "rgba(5,120,80,0.16)",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: T.card,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: T.greenSoft,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: T.text3, fontSize: 20, fontWeight: "600" },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.greenSoft,
    borderWidth: 1.5,
    borderColor: T.border2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 20 },
  headerName: {
    color: T.text,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSub: { color: T.muted, fontSize: 11, marginTop: 1 },
  headerRight: { alignItems: "center", justifyContent: "center", width: 24 },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: T.success,
    borderWidth: 2,
    borderColor: T.bg,
  },

  // States
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  errorEmoji: { fontSize: 40, marginBottom: 4 },
  stateTitle: {
    color: T.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  stateText: {
    color: T.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 11,
    backgroundColor: T.greenSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  retryBtnText: { color: T.text3, fontSize: 14, fontWeight: "600" },

  // Message list
  messageList: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    paddingBottom: 8,
    gap: 4,
  },

  // Date divider
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    gap: 8,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.border,
  },
  dateDividerText: {
    color: T.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Bubbles
  bubbleRow: {
    flexDirection: "row",
    marginVertical: 3,
  },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubbleRowTheirs: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: width * 0.72,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: T.green2,
    borderBottomRightRadius: 5,
  },
  bubbleTheirs: {
    backgroundColor: "rgba(5,40,20,0.95)",
    borderWidth: 1,
    borderColor: T.border,
    borderBottomLeftRadius: 5,
  },
  bubbleText: {
    color: T.text2,
    fontSize: 14.5,
    lineHeight: 21,
  },
  bubbleTextMine: { color: "#fff" },
  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  bubbleTime: { color: "rgba(167,243,208,0.5)", fontSize: 10 },
  bubbleTimeMine: { color: "rgba(255,255,255,0.55)" },
  readTick: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "700",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: T.border,
    backgroundColor: T.card,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "rgba(5,40,20,0.8)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: T.border2,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: T.text,
    fontSize: 14.5,
    lineHeight: 20,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: T.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: "rgba(16,185,129,0.2)",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnPressed: { backgroundColor: T.green2, transform: [{ scale: 0.94 }] },
  sendBtnIcon: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
