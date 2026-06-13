import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

const { width, height } = Dimensions.get("window");

const LANGUAGES = [
  {
    code: "bn",
    label: "বাংলা",
    sublabel: "Bengali",
    flag: "🇧🇩",
    native: true,
  },
  {
    code: "en",
    label: "English",
    sublabel: "English",
    flag: "🌐",
    native: false,
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  // Ambient orb pulse
  const orbAnim = useRef(new Animated.Value(0)).current;
  // Logo entrance
  const logoY = useRef(new Animated.Value(-30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  // Cards entrance
  const cardsY = useRef(new Animated.Value(40)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  // Button entrance
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.92)).current;
  // Selection pulse
  const selectScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Orb breathing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim, {
          toValue: 0,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Staggered entrance
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(logoY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(160),
      Animated.parallel([
        Animated.timing(cardsY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardsOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(btnScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const orbScale = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const orbOpacity = orbAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 0.85, 0.55],
  });

  const handleSelect = (code) => {
    setSelected(code);
    Animated.sequence([
      Animated.timing(selectScale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(selectScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selected) return;
    // TODO: persist language choice (AsyncStorage / store) here
    router.replace("/(auth)/login");
  };

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
        <Animated.View
          style={[
            styles.orb,
            styles.orbBottom,
            {
              transform: [{ scale: orbScale }],
              opacity: Animated.multiply(orbOpacity, 0.7),
            },
          ]}
        />
      </View>

      <View style={styles.container}>
        {/* Logo + headline */}
        <Animated.View
          style={[
            styles.logoSection,
            { opacity: logoOpacity, transform: [{ translateY: logoY }] },
          ]}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🧭</Text>
          </View>
          <Text style={styles.appName}>পথর</Text>
          <Text style={styles.appNameLatin}>PATHOR</Text>
          <Text style={styles.tagline}>Bangladesh Smart Travel</Text>
        </Animated.View>

        {/* Section label */}
        <Animated.View
          style={{ opacity: cardsOpacity, transform: [{ translateY: cardsY }] }}
        >
          <Text style={styles.sectionLabel}>Choose your language</Text>
          <Text style={styles.sectionLabelBn}>আপনার ভাষা বেছে নিন</Text>

          {/* Language cards */}
          <View style={styles.cardsRow}>
            {LANGUAGES.map((lang) => {
              const isSelected = selected === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => handleSelect(lang.code)}
                  style={({ pressed }) => [
                    styles.langCard,
                    isSelected && styles.langCardSelected,
                    pressed && styles.langCardPressed,
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.langCardInner,
                      isSelected && {
                        transform: [{ scale: selectScale }],
                      },
                    ]}
                  >
                    {/* Selection indicator ring */}
                    {isSelected && <View style={styles.selectedRing} />}

                    <Text style={styles.flag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.langLabel,
                        isSelected && styles.langLabelSelected,
                      ]}
                    >
                      {lang.label}
                    </Text>
                    <Text
                      style={[
                        styles.langSublabel,
                        isSelected && styles.langSublabelSelected,
                      ]}
                    >
                      {lang.sublabel}
                    </Text>

                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Continue button */}
        <Animated.View
          style={[
            styles.btnWrapper,
            { opacity: btnOpacity, transform: [{ scale: btnScale }] },
          ]}
        >
          <Pressable
            onPress={handleContinue}
            disabled={!selected}
            style={({ pressed }) => [
              styles.continueBtn,
              !selected && styles.continueBtnDisabled,
              pressed && selected && styles.continueBtnPressed,
            ]}
          >
            <Text
              style={[
                styles.continueBtnText,
                !selected && styles.continueBtnTextDisabled,
              ]}
            >
              {selected === "bn" ? "চালিয়ে যান" : "Continue"}
            </Text>
            <Text style={styles.continueBtnArrow}>→</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            {selected === "bn"
              ? "আপনি পরে সেটিংসে ভাষা পরিবর্তন করতে পারবেন"
              : "You can change language later in Settings"}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    gap: 32,
  },

  // Ambient orbs
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: T.orb,
  },
  orbTop: {
    width: width * 1.1,
    height: width * 1.1,
    top: -width * 0.55,
    left: -width * 0.05,
    backgroundColor: "rgba(5,120,80,0.18)",
  },
  orbBottom: {
    width: width * 0.9,
    height: width * 0.9,
    bottom: -width * 0.5,
    right: -width * 0.25,
    backgroundColor: "rgba(16,185,129,0.10)",
  },

  // Logo
  logoSection: {
    alignItems: "center",
    gap: 4,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: T.greenSoft,
    borderWidth: 1.5,
    borderColor: T.border2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: T.text,
    letterSpacing: 1,
  },
  appNameLatin: {
    fontSize: 13,
    fontWeight: "700",
    color: T.text3,
    letterSpacing: 6,
    marginTop: -2,
  },
  tagline: {
    fontSize: 13,
    color: T.muted,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // Section labels
  sectionLabel: {
    fontSize: 15,
    color: T.muted,
    textAlign: "center",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  sectionLabelBn: {
    fontSize: 13,
    color: "rgba(167,243,208,0.3)",
    textAlign: "center",
    marginBottom: 20,
  },

  // Language cards
  cardsRow: {
    flexDirection: "row",
    gap: 14,
  },
  langCard: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: T.card,
    borderWidth: 1.5,
    borderColor: T.border,
    minHeight: 148,
  },
  langCardSelected: {
    borderColor: T.green,
    backgroundColor: "rgba(16,185,129,0.09)",
  },
  langCardPressed: {
    opacity: 0.85,
  },
  langCardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
    position: "relative",
  },
  selectedRing: {
    position: "absolute",
    inset: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.35)",
  },
  flag: {
    fontSize: 38,
    marginBottom: 4,
  },
  langLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: T.text,
    textAlign: "center",
  },
  langLabelSelected: {
    color: T.text3,
  },
  langSublabel: {
    fontSize: 12,
    color: T.muted,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  langSublabelSelected: {
    color: T.green,
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: T.green,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  // Continue button
  btnWrapper: {
    gap: 14,
    alignItems: "center",
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: T.green,
    borderRadius: 16,
    paddingVertical: 17,
    width: "100%",
    shadowColor: T.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  continueBtnDisabled: {
    backgroundColor: "rgba(16,185,129,0.22)",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnPressed: {
    backgroundColor: T.green2,
    transform: [{ scale: 0.98 }],
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  continueBtnTextDisabled: {
    color: T.muted,
  },
  continueBtnArrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 12,
    color: "rgba(167,243,208,0.35)",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
