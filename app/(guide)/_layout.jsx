import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../../store/authStore";

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

// ─── Tab icon component ───────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
        <Text style={styles.tabEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Auth + role guard ────────────────────────────────────────────────────────
function GuideGuard({ children }) {
  const router = useRouter();
  const { token, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      // Not logged in at all
      router.replace("/(auth)/login");
      return;
    }

    if (user.role !== "guide") {
      // Logged in but wrong role — send travellers to their home
      router.replace("/(traveller)/home");
    }
  }, [token, user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={T.green} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  // Render nothing while redirect is in-flight
  if (!token || !user || user.role !== "guide") return null;

  return children;
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function GuideLayout() {
  return (
    <GuideGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" label="Dashboard" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📅" label="Bookings" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="💰" label="Earnings" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👤" label="Profile" focused={focused} />
            ),
          }}
        />
        {/* messaging is accessed via deep-link/push — hide from tab bar */}
        <Tabs.Screen name="messaging" options={{ href: null }} />
      </Tabs>
    </GuideGuard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Loading splash
  loadingContainer: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: {
    color: T.muted,
    fontSize: 14,
    letterSpacing: 0.4,
  },

  // Tab bar
  tabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 16,
    left: 20,
    right: 20,
    height: 68,
    borderRadius: 22,
    backgroundColor: T.card,
    borderTopWidth: 0,
    borderWidth: 1.5,
    borderColor: T.border,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
    paddingBottom: 0,
    paddingHorizontal: 8,
  },

  // Individual tab
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 8,
  },
  tabIconWrap: {
    width: 38,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabIconWrapActive: {
    backgroundColor: T.greenSoft,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: T.muted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: T.text3,
    fontWeight: "700",
  },
});
