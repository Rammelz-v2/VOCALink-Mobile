import type { AACIcon, CCLine } from "./types";

export const CURRENT_STUDENT = {
  id: 1,
  name: "Juan Dela Cruz",
  section: "SNED-A",
  teacher: "Mrs. Reyes",
};

// ─── STUDENT PROFILE (logged in student) ──────────────────────────────────────
export const AAC_ICONS: AACIcon[] = [
  // needs
  {
    id: "water",
    label: "Water",
    emoji: "💧",
    category: "needs",
    bg: "#E6F1FB",
  },
  { id: "food", label: "Food", emoji: "🍎", category: "needs", bg: "#FAEEDA" },
  {
    id: "toilet",
    label: "Bathroom",
    emoji: "🚻",
    category: "needs",
    bg: "#E1F5EE",
  },
  { id: "rest", label: "Rest", emoji: "😴", category: "needs", bg: "#EEEDFE" },
  {
    id: "medicine",
    label: "Medicine",
    emoji: "💊",
    category: "needs",
    bg: "#FCEBEB",
  },
  { id: "bag", label: "My bag", emoji: "🎒", category: "needs", bg: "#F1EFE8" },
  // emotions
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    category: "emotions",
    bg: "#FAEEDA",
  },
  { id: "sad", label: "Sad", emoji: "😢", category: "emotions", bg: "#E6F1FB" },
  {
    id: "sick",
    label: "Sick",
    emoji: "🤒",
    category: "emotions",
    bg: "#FCEBEB",
  },
  {
    id: "scared",
    label: "Scared",
    emoji: "😨",
    category: "emotions",
    bg: "#EEEDFE",
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "😠",
    category: "emotions",
    bg: "#FCEBEB",
  },
  {
    id: "confused",
    label: "Confused",
    emoji: "😕",
    category: "emotions",
    bg: "#E1F5EE",
  },
  // classroom
  {
    id: "help",
    label: "Help me",
    emoji: "✋",
    category: "classroom",
    bg: "#FAEEDA",
  },
  {
    id: "question",
    label: "Question",
    emoji: "❓",
    category: "classroom",
    bg: "#E6F1FB",
  },
  {
    id: "done",
    label: "I'm done",
    emoji: "📖",
    category: "classroom",
    bg: "#E1F5EE",
  },
  {
    id: "repeat",
    label: "Repeat",
    emoji: "🔁",
    category: "classroom",
    bg: "#EEEDFE",
  },
  {
    id: "teacher",
    label: "Teacher",
    emoji: "👩‍🏫",
    category: "classroom",
    bg: "#F1EFE8",
  },
  {
    id: "understand",
    label: "Understand",
    emoji: "💡",
    category: "classroom",
    bg: "#FAEEDA",
  },
  // actions
  { id: "yes", label: "Yes", emoji: "✅", category: "actions", bg: "#E1F5EE" },
  { id: "no", label: "No", emoji: "❌", category: "actions", bg: "#FCEBEB" },
  {
    id: "please",
    label: "Please",
    emoji: "🙏",
    category: "actions",
    bg: "#EEEDFE",
  },
  {
    id: "thankyou",
    label: "Thank you",
    emoji: "🙏",
    category: "actions",
    bg: "#E1F5EE",
  },
  {
    id: "wait",
    label: "Wait",
    emoji: "⏳",
    category: "actions",
    bg: "#FAEEDA",
  },
  {
    id: "stop",
    label: "Stop",
    emoji: "🛑",
    category: "actions",
    bg: "#FCEBEB",
  },
];

// Quick-access icons (home screen) — most frequently used
export const QUICK_ICONS = AAC_ICONS.filter((i) =>
  ["water", "toilet", "help", "question", "done", "happy"].includes(i.id),
);

// ─── LIVE CC LOG ──────────────────────────────────────────────────────────────
export const CC_LINES: CCLine[] = [
  {
    speaker: "teacher",
    text: "Good morning everyone. Let us start our lesson.",
    time: "10:05",
  },
  {
    speaker: "teacher",
    text: "Please open your Science book to page 12.",
    time: "10:08",
  },
  {
    speaker: "teacher",
    text: "Today we will discuss the parts of a plant.",
    time: "10:12",
  },
  {
    speaker: "teacher",
    text: "Listen carefully. I will explain the root system.",
    time: "10:20",
  },
];
