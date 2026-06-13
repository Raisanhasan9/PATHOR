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
  card: "rgba(5,22,12,0.82)",
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
  forgotColor: "#34D399",
  googleCard: "rgba(5,22,12,0.82)",
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
  card: "rgba(255,255,255,0.9)",
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
  forgotColor: "#059669",
  googleCard: "rgba(255,255,255,0.9)",
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

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [dark, setDark] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("traveller");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const T = dark ? DARK : LIGHT;

  const screenOp = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(24)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(28)).current;
  const formOp = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, {
          toValue: 1.1,
          duration: 3600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ring1, {
          toValue: 0.9,
          duration: 3600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.timing(screenOp, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(logoOp, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(formOp, {
        toValue: 1,
        duration: 700,
        delay: 280,
        useNativeDriver: true,
      }),
      Animated.timing(formY, {
        toValue: 0,
        duration: 700,
        delay: 280,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.role === "guide") router.replace("/(guide)/dashboard");
      else router.replace("/(traveller)/home");
    } else {
      setError(result.message || "Login failed.");
    }
  };

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

  const TAB_W = (width - 44 - 8) / 2;

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

      <Animated.View style={{ flex: 1, opacity: screenOp }}>
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
              <View
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
                <Text style={{ fontSize: 19 }}>🧭</Text>
              </View>
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

          {/* Hero */}
          <Animated.View
            style={{
              alignItems: "center",
              marginTop: 8,
              marginBottom: 32,
              opacity: logoOp,
              transform: [{ translateY: logoY }],
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: -10,
                width: 110,
                height: 110,
                borderRadius: 110,
                borderWidth: 1,
                borderColor: T.border,
                opacity: 0.4,
                transform: [{ scale: ring1 }],
              }}
            />
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: T.greenSoft,
                borderWidth: 1.5,
                borderColor: T.border2,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 42 }}>🧭</Text>
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
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "900",
                color: T.text,
                letterSpacing: -0.5,
                lineHeight: 36,
              }}
            >
              Sign in to your{"\n"}
              <Text style={{ color: T.green }}>Journey</Text>
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: T.text2,
                marginTop: 8,
                letterSpacing: 0.2,
              }}
            >
              আপনার যাত্রা চালিয়ে যান
            </Text>

            {/* Nature strip */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 20,
                width: "100%",
              }}
            >
              {[
                {
                  uri: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=80&auto=format&fit=crop",
                  label: "Sylhet 🌿",
                },
                {
                  uri: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80&auto=format&fit=crop",
                  label: "Chittagong 🌲",
                },
                {
                  uri: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=400&q=80&auto=format&fit=crop",
                  label: "Cox's Bazar 🌊",
                },
              ].map((p, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 72,
                    borderRadius: 14,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  <Animated.Image
                    source={{ uri: p.uri }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(1,10,5,0.85)"]}
                    style={[StyleSheet.absoluteFillObject, { top: "35%" }]}
                  />
                  <Text
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: 8,
                      fontSize: 8,
                      fontWeight: "800",
                      color: "#A7F3D0",
                      letterSpacing: 0.8,
                    }}
                  >
                    {p.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{ opacity: formOp, transform: [{ translateY: formY }] }}
          >
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
                    zIndex: 1,
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

            <FormInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              T={T}
            />

            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
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

            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 26, marginTop: -4 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: T.forgotColor,
                  letterSpacing: 0.3,
                }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Error message */}
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

            {/* Sign In button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: 18,
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
                  {isLoading ? "Signing in..." : "Sign In →"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: T.divider }}
              />
              <Text
                style={{
                  marginHorizontal: 14,
                  fontSize: 12,
                  color: T.muted,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                OR
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: T.divider }}
              />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[
                s.googleBtn,
                { backgroundColor: T.googleCard, borderColor: T.border },
              ]}
            >
              <Text style={{ fontSize: 20 }}>🔵</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: T.text,
                  letterSpacing: 0.2,
                }}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Register link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 5,
                marginTop: 28,
              }}
            >
              <Text style={{ color: T.muted, fontSize: 14 }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text
                  style={{ color: T.green, fontSize: 14, fontWeight: "800" }}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ alignItems: "center", marginTop: 28 }}>
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
          </Animated.View>
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
  googleBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
});
