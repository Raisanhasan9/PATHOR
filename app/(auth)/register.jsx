import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "../../store/authStore";

const { width } = Dimensions.get("window");

const DARK = {
  id: "dark",
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
  input: "rgba(5,22,12,0.75)",
  inputBorder: "rgba(52,211,153,0.22)",
  inputFocus: "rgba(52,211,153,0.5)",
  placeholder: "rgba(110,231,183,0.35)",
  tab: "rgba(5,22,12,0.7)",
  tabSel: "#10B981",
  tabText: "#10B981",
  tabTextSel: "#022C22",
  divider: "rgba(52,211,153,0.15)",
  orb: "rgba(5,120,80,0.22)",
  toggleBorder: "rgba(52,211,153,0.35)",
  toggleThumb: "#10B981",
  toggleBg: "rgba(2,18,10,0.7)",
  btnText: "#022C22",
  googleCard: "rgba(5,22,12,0.82)",
  accent: "#F59E0B",
};

const LIGHT = {
  id: "light",
  bg: "#F0FDF9",
  text: "#022C22",
  text2: "#065F46",
  text3: "#047857",
  muted: "rgba(6,95,70,0.5)",
  green: "#059669",
  green2: "#047857",
  greenSoft: "rgba(5,150,105,0.09)",
  border: "rgba(5,150,105,0.18)",
  border2: "rgba(5,150,105,0.38)",
  input: "rgba(255,255,255,0.9)",
  inputBorder: "rgba(5,150,105,0.2)",
  inputFocus: "rgba(5,150,105,0.45)",
  placeholder: "rgba(6,95,70,0.35)",
  tab: "rgba(240,253,249,0.85)",
  tabSel: "#059669",
  tabText: "#059669",
  tabTextSel: "#FFFFFF",
  divider: "rgba(5,150,105,0.15)",
  orb: "rgba(16,185,129,0.13)",
  toggleBorder: "rgba(5,150,105,0.3)",
  toggleThumb: "#059669",
  toggleBg: "rgba(240,253,249,0.85)",
  btnText: "#FFFFFF",
  googleCard: "rgba(255,255,255,0.9)",
  accent: "#D97706",
};

function ThemeToggle({ dark, onToggle, T }) {
  const anim = useRef(new Animated.Value(dark ? 0 : 1)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: dark ? 0 : 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [dark]);
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.9}
      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
    >
      <Text style={{ fontSize: 12, color: T.text2, letterSpacing: 0.5 }}>
        {dark ? "🌙 Dark" : "☀️ Light"}
      </Text>
      <View
        style={{
          zIndex: 1,
          width: 50,
          height: 27,
          borderRadius: 27,
          backgroundColor: T.toggleBg,
          borderWidth: 1,
          borderColor: T.toggleBorder,
          justifyContent: "center",
          paddingHorizontal: 4,
        }}
      >
        <Animated.View
          style={{
            width: 19,
            height: 19,
            borderRadius: 19,
            backgroundColor: T.toggleThumb,
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 23],
                }),
              },
            ],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  T,
  right,
  prefix,
}) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(borderAnim, {
      toValue: focused ? 1 : 0,
      tension: 100,
      friction: 9,
      useNativeDriver: false,
    }).start();
  }, [focused]);
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [T.inputBorder, T.inputFocus],
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "800",
          letterSpacing: 1.5,
          color: T.text3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Animated.View
        style={{
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: T.input,
          overflow: "hidden",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {prefix && (
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 15,
                borderRightWidth: 1,
                borderRightColor: T.inputBorder,
              }}
            >
              <Text style={{ fontSize: 14, color: T.text2, fontWeight: "700" }}>
                {prefix}
              </Text>
            </View>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={T.placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize || "none"}
            secureTextEntry={secureTextEntry}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 15,
              fontSize: 15,
              color: T.text,
              letterSpacing: 0.2,
            }}
          />
          {right}
        </View>
      </Animated.View>
    </View>
  );
}

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [dark, setDark] = useState(true);
  const [userType, setUserType] = useState("traveller");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const T = dark ? DARK : LIGHT;

  const formOp = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOp, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(formY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const TAB_W = (width - 44 - 8) / 2;
  const tabAnim = useRef(new Animated.Value(0)).current;
  const switchTab = (type) => {
    setUserType(type);
    Animated.spring(tabAnim, {
      toValue: type === "traveller" ? 0 : 1,
      tension: 100,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Name, email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setIsLoading(true);

    const result = await register({
      name,
      email,
      password,
      phone: phone ? `+880${phone}` : undefined,
      role: userType,
    });

    setIsLoading(false);
    if (result.success) {
      if (result.role === "guide") router.replace("/(guide)/dashboard");
      else router.replace("/(traveller)/home");
    } else {
      setError(result.message || "Registration failed.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Ambient orbs */}
      <View
        style={[StyleSheet.absoluteFillObject, { overflow: "hidden" }]}
        pointerEvents="none"
      >
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
        />
      </View>

      <Animated.View
        style={{ flex: 1, opacity: formOp, transform: [{ translateY: formY }] }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingBottom: 50,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Navbar */}
          <View style={s.nav}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: T.greenSoft,
                  borderWidth: 1,
                  borderColor: T.border2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18, color: T.green }}>←</Text>
              </TouchableOpacity>
              <View>
                <Text
                  style={{
                    fontWeight: "900",
                    fontSize: 19,
                    letterSpacing: 4,
                    color: T.green,
                    lineHeight: 22,
                  }}
                >
                  PATHOR
                </Text>
                <Text style={{ fontSize: 9, color: T.text2, letterSpacing: 3 }}>
                  পথর
                </Text>
              </View>
            </View>
            <ThemeToggle
              dark={dark}
              onToggle={() => setDark((d) => !d)}
              T={T}
            />
          </View>

          {/* Header */}
          <View
            style={{ alignItems: "center", marginTop: 8, marginBottom: 32 }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: T.greenSoft,
                borderWidth: 1.5,
                borderColor: T.border2,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 36 }}>✨</Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                letterSpacing: 2.5,
                color: T.green,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Get Started
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: T.text,
                letterSpacing: -0.5,
                textAlign: "center",
              }}
            >
              Join the <Text style={{ color: T.green }}>Journey</Text>
            </Text>
            <Text style={{ fontSize: 13, color: T.text2, marginTop: 6 }}>
              বাংলাদেশ ভ্রমণ ইকোসিস্টেমে স্বাগতম
            </Text>
          </View>

          {/* Tab switcher */}
          <View
            style={{
              backgroundColor: T.tab,
              borderRadius: 18,
              padding: 4,
              marginBottom: 26,
              borderWidth: 1,
              borderColor: T.border,
              position: "relative",
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                width: TAB_W,
                height: "100%",
                marginBottom: 4,
                borderRadius: 14,
                backgroundColor: T.tabSel,
                transform: [
                  {
                    translateX: tabAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, TAB_W + 4],
                    }),
                  },
                ],
              }}
            />
            {["traveller", "guide"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => switchTab(type)}
                style={{
                  position: "absolute",
                  top: 4,
                  width: TAB_W,
                  height: "100%",
                  marginBottom: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  left: type === "traveller" ? 4 : TAB_W + 8,
                }}
              >
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: 14,
                    color: userType === type ? T.tabTextSel : T.tabText,
                  }}
                >
                  {type === "traveller" ? "🧳  Traveller" : "🧭  Guide"}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 44 }} />
          </View>

          {/* Guide notice */}
          {userType === "guide" && (
            <View
              style={{
                backgroundColor: T.accent + "22",
                borderRadius: 14,
                padding: 14,
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: T.accent,
              }}
            >
              <Text style={{ color: T.text, fontSize: 13, lineHeight: 20 }}>
                🧭 Guide accounts require verification. You'll be reviewed
                within 24–48 hours.
              </Text>
            </View>
          )}

          {/* Fields */}
          <FormInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
            T={T}
          />
          <FormInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            T={T}
          />
          <FormInput
            label="Phone Number (Optional)"
            value={phone}
            onChangeText={setPhone}
            placeholder="1XXXXXXXXX"
            keyboardType="phone-pad"
            T={T}
            prefix="🇧🇩 +880"
          />
          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            secureTextEntry={!showPassword}
            T={T}
            right={
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={{ paddingRight: 14 }}
              >
                <Text style={{ fontSize: 18 }}>
                  {showPassword ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            }
          />

          {/* Error */}
          {error ? (
            <Text
              style={{
                color: "#ef4444",
                fontSize: 13,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          ) : null}

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            style={{
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 18,
              marginTop: 8,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <LinearGradient
              colors={[T.green, T.green2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btn}
            >
              <Text
                style={{
                  color: T.btnText,
                  fontSize: 17,
                  fontWeight: "900",
                  letterSpacing: 0.4,
                }}
              >
                {isLoading
                  ? "Creating account..."
                  : userType === "guide"
                    ? "Apply as Guide →"
                    : "Create Account →"}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Terms */}
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: T.muted,
              lineHeight: 18,
              marginBottom: 24,
            }}
          >
            By registering, you agree to our{" "}
            <Text style={{ color: T.green, fontWeight: "600" }}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={{ color: T.green, fontWeight: "600" }}>
              Privacy Policy
            </Text>
          </Text>

          {/* Login link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: T.muted, fontSize: 14 }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={{ color: T.green, fontSize: 14, fontWeight: "800" }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", marginTop: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{ height: 1, width: 36, backgroundColor: T.border }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: T.text3,
                  fontWeight: "700",
                  letterSpacing: 3,
                }}
              >
                PATHOR • পথর
              </Text>
              <View
                style={{ height: 1, width: 36, backgroundColor: T.border }}
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
      <StatusBar style={dark ? "light" : "dark"} />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 16,
  },
  btn: {
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});
