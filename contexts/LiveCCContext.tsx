import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../constants/api";

const POLL_MS = 1500;

type Speaker = "teacher" | "student" | "event";

export interface CCLine {
  id:         string;
  text:       string;
  time:       string;
  speaker:    Speaker;
  name:       string;
  failed?:    boolean;
  eventKind?: "join" | "leave" | "start" | "end";
}

interface LiveCCContextValue {
  lines:              CCLine[];
  connected:          boolean;
  teacherName:        string;
  updateSessionCode:  (code: string | null) => void;
}

const LiveCCContext = createContext<LiveCCContextValue | null>(null);

export const useLiveCC = (): LiveCCContextValue => {
  const ctx = useContext(LiveCCContext);
  if (!ctx) throw new Error("useLiveCC must be inside <LiveCCProvider>");
  return ctx;
};

export const LiveCCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();

  const [sessionCode,  setSessionCode]  = useState<string | null>(null);
  const [lines,        setLines]        = useState<CCLine[]>([]);
  const [connected,    setConnected]    = useState(false);
  const [teacherName,  setTeacherName]  = useState("Teacher");

  const studentName   = (user as any)?.full_name ?? (user as any)?.username ?? "You";
  const lastTsRef     = useRef<string>("");
  const joinedOnceRef = useRef(false);
  const prevConnected = useRef(false);

  // Reset when session ends or changes
  useEffect(() => {
    if (!sessionCode) {
      setLines([]);
      setConnected(false);
      setTeacherName("Teacher");
      lastTsRef.current     = "";
      joinedOnceRef.current = false;
      prevConnected.current = false;
    }
  }, [sessionCode]);

  const pollCaptions = useCallback(async () => {
    if (!token || !sessionCode) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/cc/messages/?since=${encodeURIComponent(lastTsRef.current)}&session_code=${sessionCode}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const msgs: any[] = res.data;
      if (msgs.length > 0) {
        const formatted: CCLine[] = msgs.map((m) => ({
          id:      m.id,
          text:    m.text,
          time:    m.sent_at
            ? new Date(m.sent_at.endsWith("Z") ? m.sent_at : m.sent_at + "Z")
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          speaker: m.speaker === "student" ? "student" : "teacher",
          name:    m.sender_name ?? (m.speaker === "student" ? studentName : teacherName),
        }));

        const firstTeacher = formatted.find(f => f.speaker === "teacher" && f.name);
        if (firstTeacher) setTeacherName(firstTeacher.name);

        setLines((prev) => {
          const confirmed    = new Set(formatted.map((f) => `${f.name}:${f.text}`));
          const withoutDupes = prev.filter(
            (l) => !(l.id.startsWith("local-") && confirmed.has(`${l.name}:${l.text}`)),
          );
          const existingIds = new Set(withoutDupes.map((l) => l.id));
          const newOnly     = formatted.filter((f) => !existingIds.has(f.id));
          return [...withoutDupes, ...newOnly];
        });
        lastTsRef.current = msgs[msgs.length - 1].sent_at;
      }
      setConnected(true);

      if (!joinedOnceRef.current) {
        joinedOnceRef.current = true;
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLines(prev => [
          { id: "event-join-self", text: "You joined the session", speaker: "event", name: "System", time, eventKind: "join" },
          ...prev,
        ]);
      }
    } catch {
      if (prevConnected.current) {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        let endText = "Session has ended";
        try {
          const statusRes = await axios.get(
            `${API_BASE_URL}/sessions/student?session_code=${encodeURIComponent(sessionCode)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (statusRes.data?.ended_reason === "inactivity") {
            endText = "Session ended due to inactivity";
          }
        } catch { /* backend unreachable — use generic message */ }
        setLines(prev => [
          ...prev,
          { id: `event-end-${Date.now()}`, text: endText, speaker: "event", name: "System", time, eventKind: "end" },
        ]);
      }
      setConnected(false);
    }
    prevConnected.current = connected;
  }, [token, sessionCode, teacherName, studentName, connected]);

  useEffect(() => {
    if (!token || !sessionCode) return;
    pollCaptions();
    const iv = setInterval(pollCaptions, POLL_MS);
    return () => clearInterval(iv);
  }, [pollCaptions, token, sessionCode]);

  const updateSessionCode = useCallback((code: string | null) => {
    setSessionCode(code);
  }, []);

  return (
    <LiveCCContext.Provider value={{ lines, connected, teacherName, updateSessionCode }}>
      {children}
    </LiveCCContext.Provider>
  );
};
