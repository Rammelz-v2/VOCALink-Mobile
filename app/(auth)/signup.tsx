import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useCrossAlert } from "../../components/CrossAlert";
// Reusing the beautiful styles your groupmate built for the login screen
import { loginStyles as styles } from "../../styles/loginStyles";

const PHOTOS = [
  { source: require("../../assets/images/hero-1.jpg"), style: styles.photoTopLeft },
  { source: require("../../assets/images/hero-2.jpg"), style: styles.photoTopRight },
  { source: require("../../assets/images/hero-3.jpg"), style: styles.photoBottomLeft },
  { source: require("../../assets/images/hero-4.jpg"), style: styles.photoBottomRight },
];

export default function SignupScreen() {
  const { signup } = useAuth();
  const showAlert = useCrossAlert();
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !username || !email || !password) {
      showAlert({ title: "Hold up!", message: "Please fill in all the fields." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showAlert({ title: "Invalid Email", message: "Please enter a valid email address (e.g. name@gmail.com)." });
      return;
    }
    if (password.length < 6) {
      showAlert({ title: "Weak Password", message: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      console.log(`🚀 Trying to register: ${username} / ${email}`);
      await signup(username, email, password, fullName);

      // Verification step removed — go straight to login instead.
      showAlert({
        title: "Success",
        message: "Your account was created successfully! You can now sign in.",
        buttons: [
          { text: "Sign In", onPress: () => router.replace("/(auth)/login" as any) },
        ],
      });

    } catch (error) {
      const err = error as any;
      const msg = err.response?.data?.detail || err.message || "Registration failed.";
      showAlert({ title: "Signup Failed", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* The Beautiful Top Header */}
          <LinearGradient colors={["#1AADDC", "#0E8DB8", "#0A6E92"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bluePanel}>
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
              <Text style={styles.brandTagline}>Join our community and start communicating seamlessly today.</Text>
            </View>
          </LinearGradient>

          {/* The Form Panel */}
          <View style={styles.formPanel}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Join VocaLink today</Text>

            <Text style={fallbackStyles.label}>Full Name</Text>
            <TextInput
              style={fallbackStyles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Juan Dela Cruz"
              autoCapitalize="words"
            />

            <Text style={fallbackStyles.label}>Username</Text>
            <TextInput
              style={fallbackStyles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="e.g. test999"
              autoCapitalize="none"
            />

            <Text style={fallbackStyles.label}>Email Address</Text>
            <TextInput
              style={fallbackStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="test999@email.com"
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
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={fallbackStyles.eyeBtn} activeOpacity={0.7}>
                <Text style={fallbackStyles.eyeText}>{showPass ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[fallbackStyles.button, loading && fallbackStyles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={fallbackStyles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login" as any)}>
                <Text style={styles.signupLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Fallback styles for inputs and buttons so we don't need the missing custom components
const fallbackStyles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', marginBottom: 8 },
  inputWrap: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 8 },
  inputInner: { flex: 1, padding: 16, fontSize: 16, color: '#111827' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText: { fontSize: 20 },
  button: { backgroundColor: '#1AADDC', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});