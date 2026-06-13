import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
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
};

// Default checklist used when no trip is linked
const DEFAULT_CATEGORIES = [
  {
    id: "documents",
    label: "Documents",
    emoji: "📄",
    items: [
      { id: "d1", text: "National ID / Passport", checked: false },
      { id: "d2", text: "Hotel booking confirmation", checked: false },
      { id: "d3", text: "Travel insurance", checked: false },
      { id: "d4", text: "Emergency contact list", checked: false },
    ],
  },
  {
    id: "clothing",
    label: "Clothing",
    emoji: "👕",
    items: [
      { id: "c1", text: "Comfortable walking shoes", checked: false },
      { id: "c2", text: "Rain jacket / umbrella", checked: false },
      { id: "c3", text: "Warm layers for hills", checked: false },
      { id: "c4", text: "Sunglasses & hat", checked: false },
    ],
  },
  {
    id: "health",
    label: "Health & Safety",
    emoji: "🩹",
    items: [
      { id: "h1", text: "First aid kit", checked: false },
      { id: "h2", text: "Prescription medicines", checked: false },
      { id: "h3", text: "Sunscreen SPF 50+", checked: false },
      { id: "h4", text: "Insect repellent", checked: false },
      { id: "h5", text: "Water purification tablets", checked: false },
    ],
  },
  {
    id: "tech",
    label: "Tech & Gadgets",
    emoji: "📱",
    items: [
      { id: "t1", text: "Phone charger & power bank", checked: false },
      { id: "t2", text: "Offline maps downloaded", checked: false },
      { id: "t3", text: "Camera / GoPro", checked: false },
      { id: "t4", text: "Earphones", checked: false },
    ],
  },
  {
    id: "money",
    label: "Money",
    emoji: "💵",
    items: [
      { id: "m1", text: "Sufficient cash (BDT)", checked: false },
      { id: "m2", text: "bKash / Nagad activated", checked: false },
      { id: "m3", text: "Emergency funds set aside", checked: false },
    ],
  },
];

export default function Checklist() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(!!tripId);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [activeCategory, setActiveCategory] = useState("documents");
  const [expandedCats, setExpandedCats] = useState([
    "documents",
    "clothing",
    "health",
    "tech",
    "money",
  ]);
  const saveTimeout = useRef(null);

  // ── Load checklist from trip if tripId provided ───────
  const loadChecklist = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await apiClient.get(`/trips/${tripId}/checklist`);
      const data = res.data.data;
      if (data?.categories?.length > 0) {
        setCategories(data.categories);
        setExpandedCats(data.categories.map((c) => c.id));
        setActiveCategory(data.categories[0]?.id);
      }
    } catch (err) {
      console.error("Checklist load error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadChecklist();
  }, []);

  // ── Auto-save to backend with debounce ────────────────
  const autoSave = (updatedCategories) => {
    if (!tripId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        await apiClient.put(`/trips/${tripId}/checklist`, {
          categories: updatedCategories,
        });
      } catch (err) {
        console.error(
          "Checklist save error:",
          err.response?.data || err.message,
        );
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  // ── Toggle item ───────────────────────────────────────
  const toggleItem = (catId, itemId) => {
    const updated = categories.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            items: cat.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item,
            ),
          }
        : cat,
    );
    setCategories(updated);
    autoSave(updated);
  };

  // ── Add custom item ───────────────────────────────────
  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = categories.map((cat) =>
      cat.id === activeCategory
        ? {
            ...cat,
            items: [
              ...cat.items,
              {
                id: `custom_${Date.now()}`,
                text: newItem.trim(),
                checked: false,
              },
            ],
          }
        : cat,
    );
    setCategories(updated);
    autoSave(updated);
    setNewItem("");
  };

  // ── Reset all ─────────────────────────────────────────
  const resetAll = () => {
    Alert.alert("Reset Checklist", "Uncheck all items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          const updated = categories.map((cat) => ({
            ...cat,
            items: cat.items.map((item) => ({ ...item, checked: false })),
          }));
          setCategories(updated);
          autoSave(updated);
        },
      },
    ]);
  };

  const toggleExpand = (catId) => {
    setExpandedCats((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId],
    );
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0,
  );
  const progress = totalItems > 0 ? checkedItems / totalItems : 0;

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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <View>
              <Text style={{ color: T.text, fontSize: 24, fontWeight: "900" }}>
                Trip Checklist ✅
              </Text>
              <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
                {checkedItems} of {totalItems} items packed
                {saving ? "  💾 saving..." : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={resetAll}
              style={{
                backgroundColor: T.greenSoft,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ color: T.text, fontSize: 13, fontWeight: "700" }}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              backgroundColor: T.border,
              borderRadius: 20,
              height: 10,
              marginBottom: 8,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 10,
                borderRadius: 20,
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: progress === 1 ? T.success : T.warning,
              }}
            />
          </View>
          <Text style={{ color: T.muted, fontSize: 12 }}>
            {Math.round(progress * 100)}% ready
            {progress === 1 ? " — You're all set! 🎉" : ""}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* ── Add Custom Item ──────────────────────────── */}
          <View
            style={{
              backgroundColor: T.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
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
              ➕ Add Custom Item
            </Text>

            {/* Category selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setActiveCategory(cat.id)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 20,
                      backgroundColor:
                        activeCategory === cat.id ? T.green : T.greenSoft,
                      borderWidth: 1,
                      borderColor:
                        activeCategory === cat.id ? T.green : T.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: activeCategory === cat.id ? "#022C22" : T.text,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                value={newItem}
                onChangeText={setNewItem}
                placeholder="e.g. Sunscreen, torch..."
                placeholderTextColor={T.muted}
                onSubmitEditing={addItem}
                style={{
                  flex: 1,
                  backgroundColor: T.bg,
                  borderWidth: 1.5,
                  borderColor: T.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: T.text,
                }}
              />
              <TouchableOpacity
                onPress={addItem}
                style={{
                  backgroundColor: T.green,
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#022C22", fontSize: 22, fontWeight: "900" }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Categories ───────────────────────────────── */}
          <View style={{ gap: 12, marginBottom: 100 }}>
            {categories.map((cat) => {
              const catChecked = cat.items.filter((i) => i.checked).length;
              const isExpanded = expandedCats.includes(cat.id);
              const isDone =
                catChecked === cat.items.length && cat.items.length > 0;

              return (
                <View
                  key={cat.id}
                  style={{
                    backgroundColor: T.card,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDone ? T.green + "44" : T.border,
                    overflow: "hidden",
                  }}
                >
                  {/* Category header */}
                  <TouchableOpacity
                    onPress={() => toggleExpand(cat.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 12 }}>
                      {cat.emoji}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: T.text,
                        }}
                      >
                        {cat.label}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: T.muted, marginTop: 2 }}
                      >
                        {catChecked}/{cat.items.length} packed
                      </Text>
                    </View>

                    {/* Mini progress */}
                    <View
                      style={{
                        width: 48,
                        height: 4,
                        backgroundColor: T.border,
                        borderRadius: 2,
                        marginRight: 10,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: isDone ? T.success : T.green,
                          width:
                            cat.items.length > 0
                              ? `${(catChecked / cat.items.length) * 100}%`
                              : "0%",
                        }}
                      />
                    </View>

                    <View
                      style={{
                        backgroundColor: isDone
                          ? T.success + "22"
                          : T.greenSoft,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 20,
                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: isDone ? T.success : T.green,
                        }}
                      >
                        {isDone
                          ? "✅ Done"
                          : `${catChecked}/${cat.items.length}`}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 16, color: T.muted }}>
                      {isExpanded ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {/* Items */}
                  {isExpanded && (
                    <View
                      style={{ borderTopWidth: 1, borderTopColor: T.border }}
                    >
                      {cat.items.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => toggleItem(cat.id, item.id)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            borderBottomWidth:
                              index < cat.items.length - 1 ? 1 : 0,
                            borderBottomColor: T.border,
                            backgroundColor: item.checked
                              ? T.success + "08"
                              : "transparent",
                          }}
                        >
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: item.checked ? T.success : T.border,
                              backgroundColor: item.checked
                                ? T.success
                                : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 14,
                            }}
                          >
                            {item.checked && (
                              <Text
                                style={{
                                  color: "#022C22",
                                  fontSize: 13,
                                  fontWeight: "900",
                                }}
                              >
                                ✓
                              </Text>
                            )}
                          </View>
                          <Text
                            style={{
                              fontSize: 14,
                              flex: 1,
                              color: item.checked ? T.muted : T.text,
                              textDecorationLine: item.checked
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {item.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
