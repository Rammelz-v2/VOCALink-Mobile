import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { loginStyles as styles } from "../../styles/loginStyles";
import { useCrossAlert } from "../../components/CrossAlert";

const PHOTOS = [
  {
    source: require("../../assets/images/hero-1.jpg"),
    style: styles.photoTopLeft,
  },
  {
    source: require("../../assets/images/hero-2.jpg"),
    style: styles.photoTopRight,
  },
  {
    source: require("../../assets/images/hero-3.jpg"),
    style: styles.photoBottomLeft,
  },
  {
    source: require("../../assets/images/hero-4.jpg"),
    style: styles.photoBottomRight,
  },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const showAlert = useCrossAlert();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      showAlert({ title: "Missing Info", message: "Please enter both your username/email and password." });
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
    } catch (error: any) {
      showAlert({ title: "Login Failed", message: "Invalid credentials. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={["#070F1E", "#0B1526", "#12213A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bluePanel}
          >
            <View style={styles.tealGlow} />
            <View style={styles.photosContainer}>
              {PHOTOS.map((photo, i) => (
                <Image key={i} source={photo.source} style={photo.style} />
              ))}
            </View>
            <View style={styles.centerBrand}>
              <View style={styles.logoIconWrapper}>
                <View style={styles.logoOuter}>
                  <View style={styles.logoMiddle}>
                    <View style={styles.logoDot} />
                  </View>
                </View>
              </View>
              <Text style={styles.brandName}>VocaLink</Text>
              <Text style={styles.brandTagline}>
                Designed for nonverbal students empowering seamless
                communication in the classroom.
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.formPanel}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to access your dashboard
            </Text>

            <Text style={fallbackStyles.label}>Username or Email</Text>
            <TextInput
              style={fallbackStyles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username or email"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={fallbackStyles.label}>Password</Text>
            <View style={fallbackStyles.inputWrap}>
              <TextInput
                style={fallbackStyles.inputInner}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={fallbackStyles.eyeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxOn]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password" as any)}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{ marginTop: 22, opacity: loading ? 0.65 : 1 }}
            >
              <LinearGradient
                colors={["#2DD4E6", "#14B8B0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={fallbackStyles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={fallbackStyles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signup" as any)}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Fallback styles for the missing components
const fallbackStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#EEF2F8",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    padding: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#EEF2F8",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    marginBottom: 4,
  },
  inputInner: {
    flex: 1,
    padding: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    padding: 13,
    borderRadius: 9,
    alignItems: "center" as const,
    shadowColor: "rgba(45,212,230,0.4)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});