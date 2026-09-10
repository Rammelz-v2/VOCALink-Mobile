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

  // Replaced the missing useAuthForm hook with standard React state!
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
      // Email-verification handling removed — just show a generic error now.
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
            colors={["#1AADDC", "#0E8DB8", "#0A6E92"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bluePanel}
          >
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

            {/* Replaced missing InputField with standard TextInput */}
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
                placeholder="••••••••••"
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={fallbackStyles.eyeBtn}
                activeOpacity={0.7}
              >
                <Text style={fallbackStyles.eyeText}>{showPass ? "🙈" : "👁"}</Text>
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

            {/* Replaced missing Button with standard TouchableOpacity */}
            <TouchableOpacity
              style={[
                fallbackStyles.button,
                loading && fallbackStyles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={fallbackStyles.buttonText}>Sign In</Text>
              )}
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
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 8,
  },
  inputInner: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#111827",
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeText: { fontSize: 20 },
  button: {
    backgroundColor: "#1AADDC",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { backgroundColor: "#9CA3AF" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});