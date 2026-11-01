import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CrossAlertProvider } from '../components/CrossAlert';
import { ThemeProvider } from '../contexts/ThemeContext';

// Keep the native splash visible until we're ready to show the app.
SplashScreen.preventAutoHideAsync();

// ── Branded JS splash (shown while auth resolves) ───────────────────────────
function AppSplash() {
  return (
    <View style={ss.root}>
      {/* Decorative rings */}
      <View style={[ss.ring, { width: 280, height: 280, bottom: -90, right: -90 }]} />
      <View style={[ss.ring, { width: 200, height: 200, top: -70, left: -50 }]} />

      <Animated.View entering={FadeIn.duration(400)} style={ss.logoWrap}>
        <View style={ss.logoInner}>
          {/* VocaLink SVG-like logo using nested Views */}
          <View style={ss.orbit3} />
          <View style={ss.orbit2} />
          <View style={ss.orbit1} />
          <View style={ss.core} />
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(120).duration(400)} style={ss.title}>
        VocaLink
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={ss.sub}>
        Your voice matters
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={ss.dots}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </Animated.View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay + 300).duration(300)}
      style={ss.dot}
    />
  );
}

function RootNavigator() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Hide the native Expo splash once auth check completes.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return <AppSplash />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CrossAlertProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </CrossAlertProvider>
    </ThemeProvider>
  );
}

const PURPLE  = '#2D226A';
const TEAL    = '#1AADDC';
const TEAL_MID = '#0DD0F5';

const ss = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(26,173,220,0.12)',
  },

  // Logo — concentric circles to match the web sidebar logo
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 16,
    // Fake gradient via a second layer below
  },
  logoInner: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  orbit1: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
  },
  orbit2: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  orbit3: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.4,
    marginTop: 7,
    marginBottom: 52,
  },

  dots: {
    flexDirection: 'row',
    gap: 9,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: TEAL,
    opacity: 0.7,
  },
});
