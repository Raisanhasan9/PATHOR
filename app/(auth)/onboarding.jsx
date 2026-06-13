import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const DARK = {
  id: "dark",
  bg: "#020B06",
  text: "#ECFDF5",
  text2: "#A7F3D0",
  text3: "#6EE7B7",
  green: "#10B981",
  green2: "#059669",
  greenSoft: "rgba(16,185,129,0.14)",
  border: "rgba(52,211,153,0.22)",
  border2: "rgba(52,211,153,0.4)",
  dot: "rgba(52,211,153,0.25)",
  dotActive: "#10B981",
  badge: "rgba(2,14,8,0.85)",
  tagBg: "rgba(16,185,129,0.18)",
  tagText: "#34D399",
  skipColor: "#6EE7B7",
  toggleBorder: "rgba(52,211,153,0.35)",
  toggleThumb: "#10B981",
  toggleBg: "rgba(2,18,10,0.7)",
  btnText: "#022C22",
  orb: "rgba(5,120,80,0.25)",
  introBg: "#010804",
  liveColor: "#34D399",
};

const LIGHT = {
  id: "light",
  bg: "#F0FDF9",
  text: "#022C22",
  text2: "#065F46",
  text3: "#047857",
  green: "#059669",
  green2: "#047857",
  greenSoft: "rgba(5,150,105,0.1)",
  border: "rgba(5,150,105,0.18)",
  border2: "rgba(5,150,105,0.35)",
  dot: "rgba(5,150,105,0.22)",
  dotActive: "#059669",
  badge: "rgba(255,255,255,0.9)",
  tagBg: "rgba(5,150,105,0.12)",
  tagText: "#065F46",
  skipColor: "#6B7280",
  toggleBorder: "rgba(5,150,105,0.3)",
  toggleThumb: "#059669",
  toggleBg: "rgba(240,253,249,0.85)",
  btnText: "#FFFFFF",
  orb: "rgba(16,185,129,0.15)",
  introBg: "#F0FDF9",
  liveColor: "#059669",
};

const SLIDES = [
  {
    id: 1,
    photo:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=85&auto=format&fit=crop",
    tag: "EXPLORE",
    tagIcon: "🧭",
    bangla: "আবিষ্কার করুন",
    headline: ["Discover", "Bangladesh"],
    accent: 1,
    body: "From the Sundarbans mangroves to the Chittagong hills — explore 64 districts of natural wonder with expert local guidance.",
    stats: [
      { val: "64", lbl: "Districts" },
      { val: "12K+", lbl: "Travelers" },
      { val: "4.9★", lbl: "Rating" },
    ],
  },
  {
    id: 2,
    photo:
      "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=900&q=85&auto=format&fit=crop",
    tag: "CONNECT",
    tagIcon: "🤝",
    bangla: "গাইড খুঁজুন",
    headline: ["Find Trusted", "Guides"],
    accent: 0,
    body: "Book verified local guides with real traveler reviews, secure messaging, and instant confirmation — anytime, anywhere.",
    stats: [
      { val: "800+", lbl: "Guides" },
      { val: "98%", lbl: "Response" },
      { val: "5min", lbl: "Avg Reply" },
    ],
  },
  {
    id: 3,
    photo:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=85&auto=format&fit=crop",
    tag: "SAFE",
    tagIcon: "🛡️",
    bangla: "নিরাপদ ভ্রমণ",
    headline: ["Travel Smart", "& Safe"],
    accent: 0,
    body: "Offline maps, emergency SOS, AI route planning, and real-time crowd insights — your safety is our priority.",
    stats: [
      { val: "24/7", lbl: "Support" },
      { val: "100%", lbl: "Offline" },
      { val: "SOS", lbl: "Emergency" },
    ],
  },
];

function CinematicIntro({ theme, onDone }) {
  const rings = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const rise = useRef(new Animated.Value(0)).current;
  const riseY = useRef(new Animated.Value(40)).current;
  const exitOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    rings.forEach((r, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 380),
          Animated.timing(r, {
            toValue: 1.6,
            duration: 2200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(r, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
    Animated.parallel([
      Animated.spring(rise, {
        toValue: 1,
        delay: 250,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(riseY, {
        toValue: 0,
        duration: 700,
        delay: 250,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => {
      Animated.timing(exitOp, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }).start(onDone);
    }, 3400);
    return () => clearTimeout(t);
  }, []);

  const SIZES = [110, 200, 330];
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: theme.introBg,
          zIndex: 9999,
          alignItems: "center",
          justifyContent: "center",
          opacity: exitOp,
        },
      ]}
    >
      {rings.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: SIZES[i],
            height: SIZES[i],
            borderRadius: 999,
            borderWidth: 1.2,
            borderColor:
              i === 0
                ? theme.border2
                : i === 1
                  ? theme.border
                  : "rgba(52,211,153,0.1)",
            opacity: r.interpolate({
              inputRange: [0, 0.08, 1, 1.6],
              outputRange: [0, 1, 0.35, 0],
            }),
            transform: [{ scale: r }],
          }}
        />
      ))}
      <Animated.View
        style={{
          alignItems: "center",
          opacity: rise,
          transform: [{ translateY: riseY }],
        }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            backgroundColor: theme.greenSoft,
            borderWidth: 1.5,
            borderColor: theme.border2,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 44 }}>🧭</Text>
        </View>
        <Text
          style={{
            fontWeight: "900",
            fontSize: 54,
            letterSpacing: 9,
            color: theme.text,
            lineHeight: 58,
          }}
        >
          PATHOR
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: theme.green,
            letterSpacing: 7,
            marginTop: 4,
          }}
        >
          পথর
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 24,
          }}
        >
          {["EXPLORE", "•", "CONNECT", "•", "DISCOVER"].map((w, i) => (
            <Text
              key={i}
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2.5,
                color: i % 2 === 1 ? theme.green2 : theme.text2,
              }}
            >
              {w}
            </Text>
          ))}
        </View>
        <View
          style={{
            marginTop: 28,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            opacity: 0.7,
          }}
        >
          {[10, 4, 22, 4, 14, 4, 8, 4, 18].map((h, i) => (
            <View
              key={i}
              style={{
                width: 3,
                height: h,
                borderRadius: 2,
                backgroundColor: theme.green,
              }}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function ThemeToggle({ dark, onToggle, theme }) {
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
      <Text style={{ fontSize: 12, color: theme.text2, letterSpacing: 0.5 }}>
        {dark ? "🌙 Dark" : "☀️ Light"}
      </Text>
      <View
        style={{
          width: 50,
          height: 27,
          borderRadius: 27,
          backgroundColor: theme.toggleBg,
          borderWidth: 1,
          borderColor: theme.toggleBorder,
          justifyContent: "center",
          paddingHorizontal: 4,
        }}
      >
        <Animated.View
          style={{
            width: 19,
            height: 19,
            borderRadius: 19,
            backgroundColor: theme.toggleThumb,
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

function Dots({ total, cur, theme }) {
  return (
    <View style={{ flexDirection: "row", gap: 7, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === cur ? 26 : 7,
            height: 7,
            borderRadius: 20,
            backgroundColor: i === cur ? theme.dotActive : theme.dot,
          }}
        />
      ))}
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const [cur, setCur] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const T = dark ? DARK : LIGHT;
  const slide = SLIDES[cur];

  const screenOp = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideY = useRef(new Animated.Value(0)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;
  const photoScale = useRef(new Animated.Value(1.06)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showIntro) {
      Animated.timing(screenOp, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      Animated.spring(photoScale, {
        toValue: 1,
        tension: 50,
        friction: 14,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showIntro]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const transition = (cb) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: -24,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      cb();
      slideY.setValue(24);
      Animated.spring(photoScale, {
        toValue: 1.06,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start(() =>
        Animated.spring(photoScale, {
          toValue: 1,
          tension: 50,
          friction: 14,
          useNativeDriver: true,
        }).start(),
      );
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const next = () => {
    if (cur < SLIDES.length - 1) transition(() => setCur((p) => p + 1));
    else router.replace("/(auth)/language");
  };

  const floatUp = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -13],
  });
  const floatDown = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });
  const PHOTO_H = height * 0.46;
  const PHOTO_W = width - 32;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {showIntro && (
        <CinematicIntro theme={T} onDone={() => setShowIntro(false)} />
      )}

      {/* Ambient orbs */}
      <View
        style={[StyleSheet.absoluteFillObject, { overflow: "hidden" }]}
        pointerEvents="none"
      >
        <View
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: 380,
            backgroundColor: T.orb,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: 260,
            backgroundColor: T.orb,
            opacity: 0.35,
          }}
        />
      </View>

      <Animated.View style={{ flex: 1, opacity: screenOp }}>
        {/* NAVBAR */}
        <View style={s.nav}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: T.greenSoft,
                borderWidth: 1,
                borderColor: T.border2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>🧭</Text>
            </View>
            <View>
              <Text
                style={{
                  fontWeight: "900",
                  fontSize: 21,
                  letterSpacing: 4,
                  color: T.green,
                  lineHeight: 24,
                }}
              >
                PATHOR
              </Text>
              <Text style={{ fontSize: 10, color: T.text2, letterSpacing: 3 }}>
                পথর
              </Text>
            </View>
          </View>
          <ThemeToggle
            dark={dark}
            onToggle={() => setDark((d) => !d)}
            theme={T}
          />
        </View>

        {/* EYEBROW PILL */}
        <Animated.View
          style={[
            s.pill,
            {
              backgroundColor: T.greenSoft,
              borderColor: T.border2,
              opacity: fadeAnim,
            },
          ]}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 7,
              backgroundColor: T.liveColor,
            }}
          />
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 2.2,
              color: T.green,
              textTransform: "uppercase",
            }}
          >
            Bangladesh Travel Network — Live
          </Text>
        </Animated.View>

        {/* PHOTO CARD */}
        <View
          style={{ alignItems: "center", paddingHorizontal: 16, marginTop: 6 }}
        >
          <Animated.View
            style={{
              width: PHOTO_W,
              height: PHOTO_H,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: T.border2,
              transform: [{ scale: photoScale }],
            }}
          >
            <Animated.Image
              source={{ uri: slide.photo }}
              style={[
                StyleSheet.absoluteFillObject,
                { transform: [{ scale: photoScale }] },
              ]}
              resizeMode="cover"
            />
            {/* Gradient overlays */}
            <LinearGradient
              colors={["rgba(1,10,5,0.38)", "transparent"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 90,
              }}
            />
            <LinearGradient
              colors={["transparent", "rgba(1,10,5,0.7)", "rgba(1,10,5,0.97)"]}
              style={[StyleSheet.absoluteFillObject, { top: "32%" }]}
            />

            {/* Top bar inside photo */}
            <View
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                right: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  backgroundColor: "rgba(1,10,5,0.68)",
                  borderWidth: 1,
                  borderColor: T.border,
                  borderRadius: 50,
                  paddingHorizontal: 13,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 13 }}>{slide.tagIcon}</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 2.5,
                    color: T.tagText,
                  }}
                >
                  {slide.tag}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "rgba(1,10,5,0.68)",
                  borderWidth: 1,
                  borderColor: T.border,
                  borderRadius: 50,
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 6,
                    backgroundColor: T.liveColor,
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    color: T.liveColor,
                    letterSpacing: 1.5,
                  }}
                >
                  LIVE
                </Text>
              </View>
            </View>

            {/* Bottom content inside photo */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 2.5,
                  color: T.text3,
                  marginBottom: 4,
                }}
              >
                {slide.bangla}
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  lineHeight: 38,
                  color: "#FFFFFF",
                  letterSpacing: -0.5,
                }}
              >
                {slide.headline.map((line, i) => (
                  <Text key={i}>
                    {i === slide.accent ? (
                      <Text style={{ color: T.text3 }}>{line}</Text>
                    ) : (
                      line
                    )}
                    {i < slide.headline.length - 1 ? "\n" : ""}
                  </Text>
                ))}
              </Text>
              {/* Stat pills */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                {slide.stats.map((st, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(2,18,10,0.75)",
                      borderWidth: 1,
                      borderColor: T.border,
                      borderRadius: 12,
                      paddingVertical: 9,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "900",
                        color: T.green,
                        letterSpacing: 0.3,
                      }}
                    >
                      {st.val}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "700",
                        color: T.text2,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {st.lbl}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Badge top-right */}
          <Animated.View
            style={[
              s.badge,
              {
                backgroundColor: T.badge,
                borderColor: T.border2,
                top: -14,
                right: 6,
                transform: [{ translateY: floatUp }],
              },
            ]}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: T.greenSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 15 }}>⭐</Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 9,
                  color: T.text2,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Top Rated
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "900",
                  color: T.text,
                  letterSpacing: -0.3,
                }}
              >
                4.9 / 5.0
              </Text>
            </View>
          </Animated.View>

          {/* Badge bottom-left */}
          <Animated.View
            style={[
              s.badge,
              {
                backgroundColor: T.badge,
                borderColor: T.border2,
                bottom: -14,
                left: 6,
                transform: [{ translateY: floatDown }],
              },
            ]}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: T.greenSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 15 }}>🗺️</Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 9,
                  color: T.text2,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Coverage
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "900",
                  color: T.green,
                  letterSpacing: -0.3,
                }}
              >
                64 Districts
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* BODY TEXT */}
        <Animated.View
          style={{
            paddingHorizontal: 24,
            marginTop: 30,
            opacity: fadeAnim,
            transform: [{ translateY: slideY }],
          }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 25,
              color: T.text2,
              letterSpacing: 0.1,
            }}
          >
            {slide.body}
          </Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* FOOTER */}
        <View style={s.footer}>
          <Dots total={SLIDES.length} cur={cur} theme={T} />
          <Animated.View
            style={{ width: "100%", transform: [{ scale: scaleBtn }] }}
          >
            <Pressable
              onPressIn={() =>
                Animated.spring(scaleBtn, {
                  toValue: 0.97,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(scaleBtn, {
                  toValue: 1,
                  useNativeDriver: true,
                }).start()
              }
              onPress={next}
              style={{ borderRadius: 18, overflow: "hidden" }}
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
                  {cur === SLIDES.length - 1 ? "Begin Journey" : "Continue"}
                </Text>
                <Text
                  style={{ color: T.btnText, fontSize: 20, fontWeight: "900" }}
                >
                  →
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          <TouchableOpacity onPress={() => router.replace("/(auth)/language")}>
            <Text
              style={{ fontSize: 13, color: T.skipColor, letterSpacing: 1 }}
            >
              Skip Intro
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <StatusBar style={dark ? "light" : "dark"} />
    </View>
  );
}

const s = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginLeft: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 38,
    gap: 16,
    alignItems: "center",
  },
  btn: {
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#10B981",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
});
