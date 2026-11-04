import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useLiveCC } from "../../contexts/LiveCCContext";
import axios from "axios";

import AACBoard  from "../../components/screens/board";
import Home      from "../../components/screens/home";
import LiveCC    from "../../components/screens/livecc";
import ProfileUI from "../../components/screens/profile";
import BottomNav, { TabName } from "../../components/ui/BottomNav";
import { Colors as C } from "../../constants/tokens";
import { API_BASE_URL } from "../../constants/api";
import { appendSentMessage } from "../../utils/sentMessages";

export default function TabsLayout() {
  const { user, token } = useAuth();
  const { updateSessionCode } = useLiveCC();

  const [active,     setActive]     = useState<TabName>("home");
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  // Keep LiveCCContext in sync with the current session code
  useEffect(() => { updateSessionCode(sessionCode); }, [sessionCode]);
  const [joining,    setJoining]    = useState(false);
  const [joinError,  setJoinError]  = useState<string | null>(null);

  // Keep a ref to the last non-null token so we can fire leave on sign-out
  const prevTokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (token) prevTokenRef.current = token;
  }, [token]);

  // ── Presence heartbeat every 30s ─────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const ping = () => axios.post(`${API_BASE_URL}/presence/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // ── Auto-restore session on login / app start ─────────────────────────────
  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE_URL}/sessions/student/current`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (res.data?.session_code) setSessionCode(res.data.session_code);
    }).catch(() => {});
  }, [token]);

  // ── Auto-leave session when user signs out ────────────────────────────────
  useEffect(() => {
    if (!user && sessionCode && prevTokenRef.current) {
      axios.post(`${API_BASE_URL}/sessions/leave/`, {}, {
        headers: { Authorization: `Bearer ${prevTokenRef.current}` },
      }).catch(() => {});
      setSessionCode(null);
      prevTokenRef.current = null;
    }
  }, [user]);

  // ── Poll to detect when session ends ─────────────────────────────────────
  useEffect(() => {
    if (!token || !sessionCode) return;
    const check = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/sessions/student?session_code=${sessionCode}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.data.active) {
          setSessionCode(null);
          setActive("home");
        }
      } catch {}
    };
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [token, sessionCode]);

  // ── Join session ──────────────────────────────────────────────────────────
  const joinSession = useCallback(async (code: string): Promise<{ ok: boolean; error?: string }> => {
    if (!token) return { ok: false, error: "Not authenticated." };
    setJoining(true);
    setJoinError(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/sessions/join/`,
        { code: code.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.active || res.data.session_code) {
        setSessionCode(res.data.session_code ?? code.trim().toUpperCase());
        return { ok: true };
      }
      const err = "Session not found. Check the code and try again.";
      setJoinError(err);
      return { ok: false, error: err };
    } catch (e: any) {
      const status = e?.response?.status;
      const err = status === 404 || status === 400
        ? "Invalid code. Ask your teacher for the correct code."
        : "Could not connect. Check your internet and try again.";
      setJoinError(err);
      return { ok: false, error: err };
    } finally {
      setJoining(false);
    }
  }, [token]);

  const leaveSession = useCallback(() => {
    if (token) {
      axios.post(`${API_BASE_URL}/sessions/leave/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setSessionCode(null);
    setJoinError(null);
  }, [token]);

  // The AAC Board is kept persistently mounted (lazily on first visit) because it holds
  // 300+ Reanimated cells — remounting it on every tab switch causes a 0.5–1s lag.
  // All other screens are cheap to remount so they use simple conditional rendering.
  const [boardMounted, setBoardMounted] = useState(false);
  useEffect(() => {
    if (active === "board") setBoardMounted(true);
  }, [active]);

  const boardActive = active === "board";

  return (
    <View style={styles.container}>
      <View style={styles.screen}>

        {/* AAC Board — kept mounted after first visit so 300+ Reanimated cells don't remount.
            When inactive it's hidden with display:none (removes it from layout so the active
            screen gets the full flex space). display:none on a normal flex child is safe on
            Android; the previous absoluteFillObject approach caused layout issues there. */}
        {boardMounted && (
          <View
            style={boardActive ? styles.boardActive : styles.boardHidden}
            pointerEvents={boardActive ? "auto" : "none"}
          >
            <AACBoard onSendToTeacher={(msg) => appendSentMessage(msg)} sessionCode={sessionCode} />
          </View>
        )}

        {/* Other tabs — normal mount/unmount (fast enough) */}
        {active === "home" && (
          <Home
            setActive={setActive}
            sessionCode={sessionCode}
            joinSession={joinSession}
            leaveSession={leaveSession}
            joining={joining}
            joinError={joinError}
          />
        )}
        {active === "livecc"  && <LiveCC setActive={(t) => setActive(t as TabName)} sessionCode={sessionCode} />}
        {active === "profile" && <ProfileUI />}

      </View>
      <BottomNav active={active} setActive={setActive} unread={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  screen:      { flex: 1 },
  boardActive: { flex: 1 },
  boardHidden: { display: "none" },
});
