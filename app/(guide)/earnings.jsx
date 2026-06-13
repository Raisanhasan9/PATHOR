import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
  warning: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  accent: "#F59E0B",
};

const NAV_TABS = [
  { label: "Dashboard", emoji: "🏠", route: "/(guide)/dashboard" },
  { label: "Bookings", emoji: "📅", route: "/(guide)/bookings" },
  { label: "Earnings", emoji: "💰", route: "/(guide)/earnings" },
];

const PERIODS = ["This Week", "This Month", "This Year"];

const PERIOD_KEY = {
  "This Week": "week",
  "This Month": "month",
  "This Year": "year",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Earnings() {
  const router = useRouter();

  const [earnings, setEarnings] = useState(null); // summary object
  const [transactions, setTransactions] = useState([]);
  const [monthly, setMonthly] = useState([]); // [{month, amount}]
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePeriod, setActivePeriod] = useState("This Month");
  const [withdrawing, setWithdrawing] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEarnings = useCallback(async () => {
    try {
      const res = await apiClient.get("/earnings", {
        params: { period: PERIOD_KEY[activePeriod] },
      });
      if (res.data?.success) {
        const data = res.data.data;

        // Support both flat and nested API shapes
        setEarnings({
          totalReceived: data.totalReceived ?? data.total ?? 0,
          pending: data.pending ?? data.pendingAmount ?? 0,
          thisMonth: data.thisMonth ?? data.currentMonth ?? 0,
          tripsDone: data.tripsDone ?? data.completedTrips ?? 0,
          available:
            data.available ??
            data.withdrawable ??
            data.totalReceived ??
            data.total ??
            0,
        });

        setTransactions(data.transactions ?? data.payments ?? []);
        setMonthly(data.monthly ?? data.monthlyBreakdown ?? []);
      } else {
        throw new Error(res.data?.message || "Failed to load earnings");
      }
    } catch (err) {
      console.error("Earnings fetch error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not load earnings.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activePeriod]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings();
  }, [fetchEarnings]);

  // ── Withdraw ──────────────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    if (!earnings?.available || earnings.available <= 0) {
      Alert.alert("Nothing to withdraw", "You have no available balance.");
      return;
    }
    Alert.alert(
      "Withdraw Funds",
      `Withdraw ৳${earnings.available.toLocaleString()} to your bKash account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setWithdrawing(true);
            try {
              const res = await apiClient.post("/earnings/withdraw", {
                amount: earnings.available,
              });
              if (res.data?.success) {
                Alert.alert("Success 🎉", "Withdrawal request submitted!");
                fetchEarnings();
              } else {
                throw new Error(res.data?.message || "Withdrawal failed");
              }
            } catch (err) {
              console.error("Withdraw error:", err);
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Could not process withdrawal.",
              );
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ],
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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
          Loading earnings…
        </Text>
      </View>
    );
  }

  // ── Bar chart helpers ─────────────────────────────────────────────────────
  const maxAmount =
    monthly.length > 0
      ? Math.max(...monthly.map((d) => d.amount ?? d.total ?? 0), 1)
      : 1;

  // Current month abbreviation for highlight
  const currentMonthAbbr = new Date().toLocaleString("en-GB", {
    month: "short",
  });

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="light" />

      {/* Ambient orbs */}
      <View
        style={{
          position: "absolute",
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: T.orb,
          opacity: 0.65,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 220,
          right: -60,
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
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: T.green2,
            paddingTop: 56,
            paddingBottom: 32,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            Earnings 💰
          </Text>
          <Text style={{ color: "#ffffff99", fontSize: 13, marginBottom: 20 }}>
            Your income overview
          </Text>

          {/* Total card */}
          <View
            style={{
              backgroundColor: "#ffffff18",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#ffffff22",
            }}
          >
            <Text style={{ color: "#ffffff88", fontSize: 13, marginBottom: 6 }}>
              Total Received
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 36,
                fontWeight: "800",
                marginBottom: 12,
              }}
            >
              ৳{(earnings?.totalReceived ?? 0).toLocaleString()}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Pending */}
              <View
                style={{
                  backgroundColor: `${T.warning}33`,
                  borderRadius: 12,
                  padding: 10,
                  flex: 1,
                }}
              >
                <Text style={{ color: "#ffffff88", fontSize: 11 }}>
                  Pending
                </Text>
                <Text
                  style={{
                    color: T.warning,
                    fontSize: 16,
                    fontWeight: "800",
                    marginTop: 2,
                  }}
                >
                  ৳{(earnings?.pending ?? 0).toLocaleString()}
                </Text>
              </View>

              {/* This month */}
              <View
                style={{
                  backgroundColor: `${T.success}33`,
                  borderRadius: 12,
                  padding: 10,
                  flex: 1,
                }}
              >
                <Text style={{ color: "#ffffff88", fontSize: 11 }}>
                  This Month
                </Text>
                <Text
                  style={{
                    color: T.success,
                    fontSize: 16,
                    fontWeight: "800",
                    marginTop: 2,
                  }}
                >
                  ৳{(earnings?.thisMonth ?? 0).toLocaleString()}
                </Text>
              </View>

              {/* Trips done */}
              <View
                style={{
                  backgroundColor: "#ffffff22",
                  borderRadius: 12,
                  padding: 10,
                  flex: 1,
                }}
              >
                <Text style={{ color: "#ffffff88", fontSize: 11 }}>
                  Trips Done
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "800",
                    marginTop: 2,
                  }}
                >
                  {earnings?.tripsDone ?? 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Period selector */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#ffffff18",
              borderRadius: 14,
              padding: 4,
            }}
          >
            {PERIODS.map((p) => {
              const active = activePeriod === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setActivePeriod(p)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 11,
                    alignItems: "center",
                    backgroundColor: active ? "#fff" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: active ? T.green2 : "#ffffff88",
                    }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* ── Bar Chart ─────────────────────────────────────────────────── */}
          {monthly.length > 0 && (
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: T.border,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: T.text,
                  marginBottom: 20,
                }}
              >
                Monthly Overview
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: 120,
                }}
              >
                {monthly.map((item) => {
                  const amt = item.amount ?? item.total ?? 0;
                  const barH = Math.max((amt / maxAmount) * 100, 4);
                  const label = item.month ?? item.label ?? "";
                  const isActive = label === currentMonthAbbr;
                  return (
                    <View key={label} style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 9,
                          marginBottom: 4,
                          color: isActive ? T.green : T.muted,
                          fontWeight: isActive ? "800" : "400",
                        }}
                      >
                        {isActive ? `৳${(amt / 1000).toFixed(0)}k` : ""}
                      </Text>
                      <View
                        style={{
                          width: 28,
                          height: barH,
                          backgroundColor: isActive ? T.green : `${T.green}33`,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: isActive ? T.green : T.muted,
                          fontWeight: isActive ? "800" : "400",
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Withdraw ──────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleWithdraw}
            disabled={withdrawing}
            style={{
              backgroundColor: T.success,
              borderRadius: 20,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              elevation: 4,
              shadowColor: T.success,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              opacity: withdrawing ? 0.7 : 1,
            }}
          >
            <View>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                Available to Withdraw
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "800",
                  marginTop: 2,
                }}
              >
                ৳{(earnings?.available ?? 0).toLocaleString()}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#ffffff22",
                borderRadius: 16,
                paddingVertical: 10,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {withdrawing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={{ fontSize: 18 }}>📲</Text>
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                  >
                    Withdraw
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* ── Transactions ──────────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: T.text }}>
              Transactions
            </Text>
          </View>

          {transactions.length === 0 ? (
            <View
              style={{
                backgroundColor: T.card,
                borderRadius: 18,
                padding: 40,
                alignItems: "center",
                borderWidth: 1,
                borderColor: T.border,
                marginBottom: 100,
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>💸</Text>
              <Text
                style={{ color: T.muted, fontSize: 14, textAlign: "center" }}
              >
                No transactions yet for this period.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10, marginBottom: 100 }}>
              {transactions.map((tx) => {
                const txId = tx._id ?? tx.id;
                const name =
                  tx.traveller?.name ??
                  tx.travellerName ??
                  tx.traveller ??
                  "Traveller";
                const avatar =
                  tx.traveller?.avatar ?? tx.traveller?.emoji ?? "👤";
                const dest = tx.destination ?? tx.destinationName ?? "—";
                const date = formatDate(tx.date ?? tx.createdAt);
                const amount = tx.amount ?? tx.price ?? 0;
                const method = tx.method ?? tx.paymentMethod ?? "bKash";
                const status = tx.status?.toLowerCase() ?? "received";
                const received =
                  status === "received" ||
                  status === "paid" ||
                  status === "completed";
                const isBkash = method?.toLowerCase().includes("bkash");

                return (
                  <View
                    key={txId}
                    style={{
                      backgroundColor: T.card,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: T.border,
                      elevation: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: T.greenSoft,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{avatar}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: T.text,
                        }}
                      >
                        {name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                      >
                        📍 {dest} • {date}
                      </Text>
                      <View style={{ flexDirection: "row", marginTop: 4 }}>
                        <View
                          style={{
                            backgroundColor: isBkash
                              ? `${T.accent}22`
                              : `${T.green}22`,
                            paddingVertical: 2,
                            paddingHorizontal: 8,
                            borderRadius: 10,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "700",
                              color: isBkash ? T.accent : T.green,
                            }}
                          >
                            {isBkash ? "📲 bKash" : "💵 Cash"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "800",
                          color: received ? T.success : T.warning,
                        }}
                      >
                        +৳{Number(amount).toLocaleString()}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          marginTop: 2,
                          fontWeight: "600",
                          color: received ? T.success : T.warning,
                        }}
                      >
                        {received ? "✅ Received" : "⏳ Pending"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Nav ────────────────────────────────────────────────────── */}
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
        {NAV_TABS.map((tab) => {
          const active = tab.label === "Earnings";
          return (
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
                  color: active ? T.green : T.muted,
                  fontWeight: active ? "800" : "600",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
