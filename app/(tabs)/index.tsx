import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

import AACBoard      from "../../components/screens/board";
import Home          from "../../components/screens/home";
import TeacherHome   from "../../components/screens/teacher-home";
import TeacherLiveCC from "../../components/screens/teacher-livecc";
import LiveCC        from "../../components/screens/livecc";
import ProfileUI     from "../../components/screens/profile";
import BottomNav, { TabName } from "../../components/ui/BottomNav";
import { Colors as C, FontSize, Radius, Shadow } from "../../constants/tokens";
import { API_BASE_URL } from "../../constants/api";
import { useLayout } from "../../hooks/useLayout";

export type ExtendedTabName = TabName | "teacher-livecc" | "sessioning";

export default function TabsLayout() {
  const { user, token } = useAuth();
  const { navHeight } = useLayout();
  const isTeacher = user?.status === "TEACHER";

  const [active,              setActive]              = useState<ExtendedTabName>("home");
  const [unread,              setUnread]              = useState(1);
  const [sessionActive,       setSessionActive]       = useState(false);
  const [teacherSessionCode,  setTeacherSessionCode]  = useState<string | null>(null);

  // ── Student session state — code-based joining ────────────────────────────
  const [sessionCode,  setSessionCode]  = useState<string | null>(null);
  const [joining,      setJoining]      = useState(false);
  const [joinError,    setJoinError]    = useState<string | null>(null);

  // ── Presence heartbeat every 30s (student only) ──────────────────────────
  useEffect(() => {
    if (!token || isTeacher) return;
    const ping = () => axios.post(`${API_BASE_URL}/presence/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [token, isTeacher]);

  // ── Teacher session poll (for "Return to Room" pill) ─────────────────────
  useEffect(() => {
    if (!isTeacher || !token) return;
    const check = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sessions/teacher`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessionActive(res.data.active);
        setTeacherSessionCode(res.data.session_code ?? null);
      } catch {}
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [isTeacher, token]);

  // ── After a student has joined, poll to detect when session ends ──────────
  // Only runs when sessionCode is non-null (student has already entered code).
  useEffect(() => {
    if (!token || isTeacher || !sessionCode) return;
    const check = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/sessions/student?session_code=${sessionCode ?? ""}`,
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
  }, [token, isTeacher, sessionCode]);

  // ── Code-based join (student enters teacher's session code) ───────────────
  // Requires POST /api/sessions/join/ on the FastAPI backend:
  //   body: { code: "ABCD12" }
  //   returns: { active: true, session_code: "ABCD12", teacher_name: "..." }
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

  const handleSendToTeacher = (msg: string) => {
    console.log("Student sent:", msg);
  };

  // ── Screen renderer ──────────────────────────────────────────────────────
  const renderScreen = () => {
    if (isTeacher) {
      switch (active) {
        case "home":           return (
          <TeacherHome
            setActive={setActive}
            sessionActive={sessionActive}
            sessionCode={teacherSessionCode}
            onSessionChange={(active, code) => {
              setSessionActive(active);
              setTeacherSessionCode(code);
            }}
          />
        );
        case "teacher-livecc": return <TeacherLiveCC setActive={setActive} />;
        case "profile":        return <ProfileUI />;
        default:               return <TeacherHome setActive={setActive} />;
      }
    }

    switch (active) {
      case "home":
        return (
          <Home
            setActive={setActive}
            sessionCode={sessionCode}
            joinSession={joinSession}
            leaveSession={leaveSession}
            joining={joining}
            joinError={joinError}
          />
        );
      case "board":
        return <AACBoard onSendToTeacher={handleSendToTeacher} sessionCode={sessionCode} />;
      case "livecc":
        return <LiveCC setActive={(tab) => setActive(tab as ExtendedTabName)} sessionCode={sessionCode} />;
      case "profile":
        return <ProfileUI />;
      default:
        return null;
    }
  };

  const showReturnPill = isTeacher && sessionActive && active !== "teacher-livecc";

  return (
    <View style={styles.container}>
      <Animated.View key={active} entering={FadeIn.duration(200)} style={styles.screen}>
        {renderScreen()}
      </Animated.View>

      {showReturnPill && (
        <TouchableOpacity
          style={[styles.returnPill, { bottom: navHeight + 8 }]}
          onPress={() => setActive("teacher-livecc")}
          activeOpacity={0.88}
        >
          <Text style={styles.returnPillDot}>🟢</Text>
          <Text style={styles.returnPillText}>Return to Live Room</Text>
          <Text style={styles.returnPillArrow}>›</Text>
        </TouchableOpacity>
      )}

      <BottomNav
        active={(active === "teacher-livecc" ? "home" : active) as TabName}
        setActive={(tab) => setActive(tab)}
        unread={unread}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  screen:    { flex: 1 },
  returnPill: {
    position: "absolute", alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#047857",
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadow.md,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  returnPillDot:   { fontSize: 14 },
  returnPillText:  { fontSize: FontSize.sm, color: "#FFFFFF", fontWeight: "700" },
  returnPillArrow: { fontSize: 18, color: "#FFFFFF", fontWeight: "300" },
});
