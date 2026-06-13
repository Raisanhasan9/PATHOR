import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
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
};

const NAV_TABS = [
  { label: "Dashboard", emoji: "🏠", route: "/(guide)/dashboard" },
  { label: "Bookings", emoji: "📅", route: "/(guide)/bookings" },
  { label: "Earnings", emoji: "💰", route: "/(guide)/earnings" },
];

const LANGUAGE_OPTIONS = ["বাংলা", "English", "Hindi", "Arabic"];
const SPECIALTY_OPTIONS = [
  "Beach & Coast",
  "Hill Tracts",
  "Eco & Forest",
  "Heritage & Culture",
  "Adventure",
  "Photography",
  "Food Tours",
  "Wildlife",
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 12,
          color: T.muted,
          marginBottom: 6,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor={T.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          backgroundColor: T.bg,
          borderWidth: 1,
          borderColor: T.border2,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 14 : 13,
          color: T.text,
          fontSize: 14,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

function TagPill({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: selected ? T.green : T.greenSoft,
        borderWidth: 1,
        borderColor: selected ? T.green : T.border,
        marginBottom: 8,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: selected ? "#fff" : T.text2,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function GuideProfile() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    area: "",
    pricePerDay: "",
    experience: "",
    languages: [], // string[]
    specialties: [], // string[]
    nidNumber: "",
    bkashNumber: "",
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/guides/me");
      if (res.data?.success) {
        const p = res.data.data;
        setProfile(p);
        setForm({
          name: p.name ?? p.fullName ?? "",
          phone: p.phone ?? "",
          bio: p.bio ?? p.description ?? "",
          area: p.area ?? p.location ?? "",
          pricePerDay: String(p.pricePerDay ?? p.price ?? ""),
          experience: String(p.experience ?? p.yearsExp ?? ""),
          languages: p.languages ?? [],
          specialties: p.specialties ?? p.expertise ?? [],
          nidNumber: p.nidNumber ?? p.nid ?? "",
          bkashNumber: p.bkashNumber ?? p.bkash ?? "",
        });
      } else {
        throw new Error(res.data?.message || "Failed to load profile");
      }
    } catch (err) {
      console.error("Guide profile fetch error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not load profile.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerDay: form.pricePerDay ? Number(form.pricePerDay) : undefined,
        experience: form.experience ? Number(form.experience) : undefined,
      };
      const res = await apiClient.put("/guides/me", payload);
      if (res.data?.success) {
        setProfile(res.data.data ?? { ...profile, ...payload });
        setEditMode(false);
        Alert.alert("Saved ✅", "Your profile has been updated.");
      } else {
        throw new Error(res.data?.message || "Save failed");
      }
    } catch (err) {
      console.error("Guide profile save error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not save profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await apiClient.post("/auth/logout").catch(() => {});
          } finally {
            logout();
            router.replace("/(auth)/login");
          }
        },
      },
    ]);
  };

  // ── Tag helpers ───────────────────────────────────────────────────────────
  const toggleTag = (field, value) => {
    setForm((prev) => {
      const arr = prev[field] ?? [];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
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
          Loading profile…
        </Text>
      </View>
    );
  }

  // ── Derived display values ────────────────────────────────────────────────
  const displayName = profile?.name ?? profile?.fullName ?? "Guide";
  const displayArea = profile?.area ?? profile?.location ?? "";
  const rating =
    profile?.rating != null ? Number(profile.rating).toFixed(1) : "—";
  const totalBookings = profile?.totalBookings ?? profile?.bookingCount ?? 0;
  const totalEarnings = profile?.totalEarnings ?? profile?.earnings ?? 0;
  const isVerified = profile?.verified ?? profile?.isVerified ?? false;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />

      {/* Ambient orbs */}
      <View
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: T.orb,
          opacity: 0.65,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 300,
          left: -70,
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
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: T.green2,
            paddingTop: 56,
            paddingBottom: 36,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: "#ffffff22",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              borderWidth: 3,
              borderColor: "#ffffff44",
            }}
          >
            <Text style={{ fontSize: 48 }}>🧔</Text>
          </View>

          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            {displayName}
          </Text>

          {displayArea ? (
            <Text style={{ color: "#ffffff99", fontSize: 13, marginBottom: 6 }}>
              📍 {displayArea}
            </Text>
          ) : null}

          {/* Verified badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: isVerified ? `${T.success}33` : `${T.warning}33`,
              paddingVertical: 5,
              paddingHorizontal: 14,
              borderRadius: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 13 }}>{isVerified ? "✅" : "⏳"}</Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: isVerified ? T.success : T.warning,
              }}
            >
              {isVerified ? "Verified Guide" : "Verification Pending"}
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            {[
              { emoji: "⭐", value: rating, label: "Rating" },
              { emoji: "📅", value: String(totalBookings), label: "Trips" },
              {
                emoji: "💰",
                value: `৳${(totalEarnings / 1000).toFixed(1)}k`,
                label: "Earned",
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff18",
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, marginBottom: 4 }}>
                  {stat.emoji}
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{ fontSize: 10, color: "#ffffff88", marginTop: 2 }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* ── Edit / Save toggle ────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => {
                if (editMode) {
                  // Cancel — reset form to last saved profile
                  setForm({
                    name: profile?.name ?? profile?.fullName ?? "",
                    phone: profile?.phone ?? "",
                    bio: profile?.bio ?? profile?.description ?? "",
                    area: profile?.area ?? profile?.location ?? "",
                    pricePerDay: String(
                      profile?.pricePerDay ?? profile?.price ?? "",
                    ),
                    experience: String(
                      profile?.experience ?? profile?.yearsExp ?? "",
                    ),
                    languages: profile?.languages ?? [],
                    specialties:
                      profile?.specialties ?? profile?.expertise ?? [],
                    nidNumber: profile?.nidNumber ?? profile?.nid ?? "",
                    bkashNumber: profile?.bkashNumber ?? profile?.bkash ?? "",
                  });
                  setEditMode(false);
                } else {
                  setEditMode(true);
                }
              }}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: editMode ? T.bg : T.green,
                borderWidth: editMode ? 1 : 0,
                borderColor: T.border2,
              }}
            >
              <Text
                style={{
                  color: editMode ? T.muted : "#fff",
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {editMode ? "✕ Cancel" : "✏️ Edit Profile"}
              </Text>
            </TouchableOpacity>

            {editMode && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 16,
                  alignItems: "center",
                  backgroundColor: T.green,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                  >
                    💾 Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Basic Info ────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👤 Basic Info</Text>
            {editMode ? (
              <>
                <Field
                  label="Full Name"
                  value={form.name}
                  onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                  keyboardType="phone-pad"
                />
                <Field
                  label="Location / Area"
                  value={form.area}
                  onChangeText={(v) => setForm((p) => ({ ...p, area: v }))}
                  placeholder="e.g. Cox's Bazar, Chattogram"
                />
                <Field
                  label="Bio"
                  value={form.bio}
                  onChangeText={(v) => setForm((p) => ({ ...p, bio: v }))}
                  placeholder="Tell travellers about yourself…"
                  multiline
                />
              </>
            ) : (
              <View style={{ gap: 12 }}>
                {[
                  { emoji: "📛", label: "Name", value: displayName },
                  { emoji: "📞", label: "Phone", value: profile?.phone ?? "—" },
                  { emoji: "📍", label: "Area", value: displayArea || "—" },
                  ...(memberSince
                    ? [
                        {
                          emoji: "🗓️",
                          label: "Member Since",
                          value: memberSince,
                        },
                      ]
                    : []),
                ].map((row) => (
                  <View
                    key={row.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: 18, width: 28 }}>{row.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: T.muted }}>
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: T.text,
                          fontWeight: "600",
                          marginTop: 2,
                        }}
                      >
                        {row.value}
                      </Text>
                    </View>
                  </View>
                ))}
                {profile?.bio || profile?.description ? (
                  <View
                    style={{
                      backgroundColor: T.bg,
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: T.border,
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 13, color: T.text2, lineHeight: 20 }}
                    >
                      "{profile?.bio ?? profile?.description}"
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* ── Guide Details ─────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧭 Guide Details</Text>
            {editMode ? (
              <>
                <Field
                  label="Price per Day (৳)"
                  value={form.pricePerDay}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, pricePerDay: v }))
                  }
                  keyboardType="numeric"
                  placeholder="e.g. 2500"
                />
                <Field
                  label="Years of Experience"
                  value={form.experience}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, experience: v }))
                  }
                  keyboardType="numeric"
                  placeholder="e.g. 5"
                />
              </>
            ) : (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: T.bg,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: T.border,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>💰</Text>
                  <Text
                    style={{ fontSize: 15, fontWeight: "800", color: T.green }}
                  >
                    ৳
                    {Number(
                      profile?.pricePerDay ?? profile?.price ?? 0,
                    ).toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                    Per Day
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: T.bg,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: T.border,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>📆</Text>
                  <Text
                    style={{ fontSize: 15, fontWeight: "800", color: T.green }}
                  >
                    {profile?.experience ?? profile?.yearsExp ?? "—"} yr
                    {(profile?.experience ?? profile?.yearsExp) !== 1
                      ? "s"
                      : ""}
                  </Text>
                  <Text style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                    Experience
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Languages ─────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🗣️ Languages</Text>
            {editMode ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <TagPill
                    key={lang}
                    label={lang}
                    selected={form.languages.includes(lang)}
                    onPress={() => toggleTag("languages", lang)}
                  />
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(profile?.languages ?? []).length > 0 ? (
                  (profile?.languages ?? []).map((lang) => (
                    <View
                      key={lang}
                      style={{
                        backgroundColor: T.greenSoft,
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: T.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: T.text2,
                          fontWeight: "600",
                        }}
                      >
                        {lang}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: T.muted, fontSize: 13 }}>
                    No languages added yet.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* ── Specialties ───────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏔️ Specialties</Text>
            {editMode ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {SPECIALTY_OPTIONS.map((sp) => (
                  <TagPill
                    key={sp}
                    label={sp}
                    selected={form.specialties.includes(sp)}
                    onPress={() => toggleTag("specialties", sp)}
                  />
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(profile?.specialties ?? profile?.expertise ?? []).length >
                0 ? (
                  (profile?.specialties ?? profile?.expertise ?? []).map(
                    (sp) => (
                      <View
                        key={sp}
                        style={{
                          backgroundColor: T.greenSoft,
                          paddingVertical: 6,
                          paddingHorizontal: 14,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: T.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: T.text2,
                            fontWeight: "600",
                          }}
                        >
                          {sp}
                        </Text>
                      </View>
                    ),
                  )
                ) : (
                  <Text style={{ color: T.muted, fontSize: 13 }}>
                    No specialties added yet.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* ── Payment Info ──────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💳 Payment Info</Text>
            {editMode ? (
              <>
                <Field
                  label="bKash Number"
                  value={form.bkashNumber}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, bkashNumber: v }))
                  }
                  keyboardType="phone-pad"
                  placeholder="01XXXXXXXXX"
                />
                <Field
                  label="NID Number"
                  value={form.nidNumber}
                  onChangeText={(v) => setForm((p) => ({ ...p, nidNumber: v }))}
                  keyboardType="numeric"
                  placeholder="National ID number"
                />
              </>
            ) : (
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 18, width: 28 }}>📲</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: T.muted }}>
                      bKash Number
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: T.text,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      {profile?.bkashNumber ?? profile?.bkash ?? "—"}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 18, width: 28 }}>🪪</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: T.muted }}>
                      NID Number
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: T.text,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      {(profile?.nidNumber ?? profile?.nid)
                        ? "••••••••" +
                          String(profile?.nidNumber ?? profile?.nid).slice(-4)
                        : "—"}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── Verification Status ───────────────────────────────────────── */}
          <View
            style={{
              ...styles.card,
              backgroundColor: isVerified ? `${T.success}0F` : `${T.warning}0F`,
              borderColor: isVerified ? `${T.success}33` : `${T.warning}33`,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={{ fontSize: 32 }}>{isVerified ? "✅" : "⏳"}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: T.text }}
                >
                  {isVerified ? "Verified Guide" : "Verification Pending"}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    marginTop: 3,
                    lineHeight: 18,
                  }}
                >
                  {isVerified
                    ? "Your identity has been verified. Travellers can see your verified badge."
                    : "Submit your NID and photo above. Verification takes 1–2 business days."}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Logout ────────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            style={{
              borderWidth: 1,
              borderColor: `${T.danger}44`,
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              marginBottom: 100,
              opacity: loggingOut ? 0.6 : 1,
            }}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color={T.danger} />
            ) : (
              <>
                <Text style={{ fontSize: 20 }}>🚪</Text>
                <Text
                  style={{ color: T.danger, fontWeight: "700", fontSize: 15 }}
                >
                  Log Out
                </Text>
              </>
            )}
          </TouchableOpacity>
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
        {NAV_TABS.map((tab) => (
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
                color: T.muted,
                fontWeight: "600",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  card: {
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.border,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: T.text,
    marginBottom: 16,
  },
};
