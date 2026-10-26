import type { AACIcon, CCLine } from "./types";

export const CURRENT_STUDENT = {
  id: 1,
  name: "Juan Dela Cruz",
  section: "SNED-A",
  teacher: "Mrs. Reyes",
};

// ─── AAC ICONS ────────────────────────────────────────────────────────────────
export const AAC_ICONS: AACIcon[] = [
  // needs
  { id: "water",    label: "Water",    emoji: "💧", category: "needs", bg: "#E6F1FB" },
  { id: "food",     label: "Food",     emoji: "🍎", category: "needs", bg: "#FAEEDA" },
  { id: "toilet",   label: "Bathroom", emoji: "🚻", category: "needs", bg: "#E1F5EE" },
  { id: "rest",     label: "Rest",     emoji: "😴", category: "needs", bg: "#EEEDFE" },
  { id: "medicine", label: "Medicine", emoji: "💊", category: "needs", bg: "#FCEBEB" },
  { id: "bag",      label: "My bag",   emoji: "🎒", category: "needs", bg: "#F1EFE8" },

  // emotions
  { id: "happy",    label: "Happy",    emoji: "😊", category: "emotions", bg: "#FAEEDA" },
  { id: "sad",      label: "Sad",      emoji: "😢", category: "emotions", bg: "#E6F1FB" },
  { id: "sick",     label: "Sick",     emoji: "🤒", category: "emotions", bg: "#FCEBEB" },
  { id: "scared",   label: "Scared",   emoji: "😨", category: "emotions", bg: "#EEEDFE" },
  { id: "angry",    label: "Angry",    emoji: "😠", category: "emotions", bg: "#FCEBEB" },
  { id: "confused", label: "Confused", emoji: "😕", category: "emotions", bg: "#E1F5EE" },

  // classroom
  { id: "help",       label: "Help me",    emoji: "✋",    category: "classroom", bg: "#FAEEDA" },
  { id: "question",   label: "Question",   emoji: "❓",    category: "classroom", bg: "#E6F1FB" },
  { id: "done",       label: "I'm done",   emoji: "📖",    category: "classroom", bg: "#E1F5EE" },
  { id: "repeat",     label: "Repeat",     emoji: "🔁",    category: "classroom", bg: "#EEEDFE" },
  { id: "teacher",    label: "Teacher",    emoji: "👩‍🏫", category: "classroom", bg: "#F1EFE8" },
  { id: "understand", label: "Understand", emoji: "💡",    category: "classroom", bg: "#FAEEDA" },

  // actions
  { id: "yes",      label: "Yes",       emoji: "✅", category: "actions", bg: "#E1F5EE" },
  { id: "no",       label: "No",        emoji: "❌", category: "actions", bg: "#FCEBEB" },
  { id: "please",   label: "Please",    emoji: "🙏", category: "actions", bg: "#EEEDFE" },
  { id: "thankyou", label: "Thank you", emoji: "🙏", category: "actions", bg: "#E1F5EE" },
  { id: "wait",     label: "Wait",      emoji: "⏳", category: "actions", bg: "#FAEEDA" },
  { id: "stop",     label: "Stop",      emoji: "🛑", category: "actions", bg: "#FCEBEB" },

  // emergency (these send to the teacher immediately — see REQUEST_TYPE_BY_ICON_ID in board.tsx)
  { id: "emergency",   label: "Emergency",   emoji: "🚨", category: "emergency", bg: "#FEE2E2" },
  { id: "hurt",        label: "I'm hurt",    emoji: "🤕", category: "emergency", bg: "#FEE2E2" },
  { id: "stomachache", label: "Tummy hurts", emoji: "🤢", category: "emergency", bg: "#FEE2E2" },
  { id: "dizzy",       label: "Dizzy",       emoji: "😵", category: "emergency", bg: "#FEE2E2" },
  { id: "unsafe",      label: "Not safe",    emoji: "⚠️", category: "emergency", bg: "#FEF3C7" },
  { id: "get_adult",   label: "Get adult",   emoji: "🙋", category: "emergency", bg: "#FEF3C7" },

  // math
  { id: "math_plus",    label: "Plus",      emoji: "➕",  category: "math", bg: "#DBEAFE" },
  { id: "math_minus",   label: "Minus",     emoji: "➖",  category: "math", bg: "#DBEAFE" },
  { id: "math_times",   label: "Times",     emoji: "✖️",  category: "math", bg: "#DBEAFE" },
  { id: "math_divide",  label: "Divide",    emoji: "➗",  category: "math", bg: "#DBEAFE" },
  { id: "math_equals",  label: "Equals",    emoji: "🟰",  category: "math", bg: "#DBEAFE" },
  { id: "math_numbers", label: "Numbers",   emoji: "🔢",  category: "math", bg: "#E0E7FF" },
  { id: "math_count",   label: "Count",     emoji: "🧮",  category: "math", bg: "#E0E7FF" },
  { id: "math_shapes",  label: "Shapes",    emoji: "📐",  category: "math", bg: "#E0E7FF" },
  { id: "math_measure", label: "Measure",   emoji: "📏",  category: "math", bg: "#E0E7FF" },
  { id: "math_more",    label: "More",      emoji: "⬆️",  category: "math", bg: "#DCFCE7" },
  { id: "math_less",    label: "Less",      emoji: "⬇️",  category: "math", bg: "#DCFCE7" },
  { id: "math_answer",  label: "My answer", emoji: "📝",  category: "math", bg: "#FEF9C3" },

  // numbers (shown in the Math tab)
  { id: "num_0",  label: "0",  emoji: "0️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_1",  label: "1",  emoji: "1️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_2",  label: "2",  emoji: "2️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_3",  label: "3",  emoji: "3️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_4",  label: "4",  emoji: "4️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_5",  label: "5",  emoji: "5️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_6",  label: "6",  emoji: "6️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_7",  label: "7",  emoji: "7️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_8",  label: "8",  emoji: "8️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_9",  label: "9",  emoji: "9️⃣", category: "math", bg: "#E0E7FF" },
  { id: "num_10", label: "10", emoji: "🔟", category: "math", bg: "#E0E7FF" },

  // communication
  { id: "comm_hello",    label: "Hello",      emoji: "👋", category: "communication", bg: "#FCE7F3" },
  { id: "comm_sorry",    label: "Sorry",      emoji: "😔", category: "communication", bg: "#FCE7F3" },
  { id: "comm_excuse",   label: "Excuse me",  emoji: "🙇", category: "communication", bg: "#FCE7F3" },
  { id: "comm_goodjob",  label: "Good job",   emoji: "👏", category: "communication", bg: "#FCE7F3" },
  { id: "comm_myturn",   label: "My turn",    emoji: "👉", category: "communication", bg: "#EDE9FE" },
  { id: "comm_yourturn", label: "Your turn",  emoji: "👈", category: "communication", bg: "#EDE9FE" },
  { id: "comm_talk",     label: "Talk to me", emoji: "💬", category: "communication", bg: "#EDE9FE" },
  { id: "comm_listen",   label: "Listen",     emoji: "👂", category: "communication", bg: "#EDE9FE" },
  { id: "comm_louder",   label: "Louder",     emoji: "🔊", category: "communication", bg: "#E0F2FE" },
  { id: "comm_slower",   label: "Slow down",  emoji: "🐢", category: "communication", bg: "#E0F2FE" },

  // ── needs (extra) ─────────────────────────────────────────────────────────
  { id: "cold",       label: "I'm cold",     emoji: "🥶", category: "needs", bg: "#E6F1FB" },
  { id: "hot",        label: "Too hot",      emoji: "🥵", category: "needs", bg: "#FCEBEB" },
  { id: "too_loud",   label: "Too loud",     emoji: "🔇", category: "needs", bg: "#EEEDFE" },
  { id: "pencil",     label: "Need pencil",  emoji: "✏️", category: "needs", bg: "#FAEEDA" },
  { id: "tissue",     label: "Tissue",       emoji: "🤧", category: "needs", bg: "#E1F5EE" },
  { id: "need_break", label: "Need a break", emoji: "⏸️", category: "needs", bg: "#F1EFE8" },
  { id: "go_outside", label: "Go outside",   emoji: "🌳", category: "needs", bg: "#E1F5EE" },
  { id: "fix_chair",  label: "Fix my seat",  emoji: "🪑", category: "needs", bg: "#F1EFE8" },

  // ── emotions (extra) ──────────────────────────────────────────────────────
  { id: "excited",     label: "Excited",     emoji: "🤩", category: "emotions", bg: "#FAEEDA" },
  { id: "tired",       label: "Tired",       emoji: "😴", category: "emotions", bg: "#E6F1FB" },
  { id: "bored",       label: "Bored",       emoji: "😑", category: "emotions", bg: "#EEEDFE" },
  { id: "worried",     label: "Worried",     emoji: "😟", category: "emotions", bg: "#FCEBEB" },
  { id: "frustrated",  label: "Frustrated",  emoji: "😤", category: "emotions", bg: "#FCEBEB" },
  { id: "calm",        label: "Calm",        emoji: "😌", category: "emotions", bg: "#E1F5EE" },
  { id: "proud",       label: "Proud",       emoji: "🏆", category: "emotions", bg: "#FAEEDA" },
  { id: "embarrassed", label: "Embarrassed", emoji: "😳", category: "emotions", bg: "#EEEDFE" },

  // ── classroom (extra) ─────────────────────────────────────────────────────
  { id: "not_understand", label: "Don't get it", emoji: "🤔", category: "classroom", bg: "#E6F1FB" },
  { id: "more_time",      label: "More time",    emoji: "⏰", category: "classroom", bg: "#FAEEDA" },
  { id: "write",          label: "Write",        emoji: "✍️", category: "classroom", bg: "#E1F5EE" },
  { id: "read",           label: "Read",         emoji: "📚", category: "classroom", bg: "#F1EFE8" },
  { id: "group_work",     label: "Group work",   emoji: "👥", category: "classroom", bg: "#EEEDFE" },
  { id: "worksheet",      label: "Worksheet",    emoji: "📄", category: "classroom", bg: "#FAEEDA" },
  { id: "computer",       label: "Computer",     emoji: "💻", category: "classroom", bg: "#E6F1FB" },
  { id: "show_me",        label: "Show me",      emoji: "👁️", category: "classroom", bg: "#FAEEDA" },
  { id: "notebook",       label: "Notebook",     emoji: "📓", category: "classroom", bg: "#E1F5EE" },
  { id: "sit_down",       label: "Sit down",     emoji: "🪑", category: "classroom", bg: "#F1EFE8" },
  { id: "line_up",        label: "Line up",      emoji: "🚶", category: "classroom", bg: "#E1F5EE" },
  { id: "activity",       label: "Activity",     emoji: "🎯", category: "classroom", bg: "#EEEDFE" },

  // ── actions (extra) ───────────────────────────────────────────────────────
  { id: "more_a",    label: "More",      emoji: "🔼", category: "actions", bg: "#E1F5EE" },
  { id: "give_me",   label: "Give me",   emoji: "🤲", category: "actions", bg: "#FAEEDA" },
  { id: "come_here", label: "Come here", emoji: "🫵", category: "actions", bg: "#EEEDFE" },
  { id: "open_it",   label: "Open",      emoji: "🔓", category: "actions", bg: "#E1F5EE" },
  { id: "finished",  label: "Finished",  emoji: "🏁", category: "actions", bg: "#E1F5EE" },
  { id: "go_a",      label: "Go",        emoji: "🚶", category: "actions", bg: "#FAEEDA" },
  { id: "try_it",    label: "Try",       emoji: "💪", category: "actions", bg: "#EEEDFE" },
  { id: "again",     label: "Again",     emoji: "🔄", category: "actions", bg: "#E6F1FB" },

  // ── emergency (extra — all send immediately to teacher) ───────────────────
  { id: "headache",      label: "Headache",      emoji: "🤯", category: "emergency", bg: "#FEE2E2" },
  { id: "cant_breathe",  label: "Can't breathe", emoji: "😮‍💨", category: "emergency", bg: "#FEE2E2" },
  { id: "bleeding",      label: "Bleeding",      emoji: "🩸", category: "emergency", bg: "#FEE2E2" },
  { id: "very_scared",   label: "Very scared",   emoji: "😱", category: "emergency", bg: "#FEE2E2" },
  { id: "being_bullied", label: "Being bullied", emoji: "😢", category: "emergency", bg: "#FEF3C7" },
  { id: "fell_down",     label: "I fell",        emoji: "🤸", category: "emergency", bg: "#FEE2E2" },
  { id: "fever",         label: "Fever",         emoji: "🌡️", category: "emergency", bg: "#FEE2E2" },

  // ── math (extra) ──────────────────────────────────────────────────────────
  { id: "math_time",    label: "Time",    emoji: "🕐", category: "math", bg: "#DBEAFE" },
  { id: "math_money",   label: "Money",   emoji: "💵", category: "math", bg: "#DBEAFE" },
  { id: "math_pattern", label: "Pattern", emoji: "🔷", category: "math", bg: "#E0E7FF" },
  { id: "math_bigger",  label: "Bigger",  emoji: "🔼", category: "math", bg: "#DCFCE7" },
  { id: "math_smaller", label: "Smaller", emoji: "🔽", category: "math", bg: "#DCFCE7" },
  { id: "math_hundred", label: "Hundred", emoji: "💯", category: "math", bg: "#E0E7FF" },

  // ── communication (extra) ─────────────────────────────────────────────────
  { id: "comm_goodbye",      label: "Goodbye",      emoji: "🤚", category: "communication", bg: "#FCE7F3" },
  { id: "comm_good_morning", label: "Good morning", emoji: "☀️", category: "communication", bg: "#FCE7F3" },
  { id: "comm_i_want",       label: "I want",       emoji: "🙋", category: "communication", bg: "#EDE9FE" },
  { id: "comm_i_like",       label: "I like",       emoji: "❤️", category: "communication", bg: "#FCE7F3" },
  { id: "comm_i_dont_like",  label: "I don't like", emoji: "💔", category: "communication", bg: "#FCE7F3" },
  { id: "comm_friend",       label: "Friend",       emoji: "🤝", category: "communication", bg: "#EDE9FE" },
  { id: "comm_agree",        label: "I agree",      emoji: "👍", category: "communication", bg: "#E0F2FE" },
  { id: "comm_disagree",     label: "I disagree",   emoji: "👎", category: "communication", bg: "#E0F2FE" },

  // ── people (new category) ─────────────────────────────────────────────────
  { id: "people_me",        label: "Me",        emoji: "🙍", category: "people", bg: "#FFF7ED" },
  { id: "people_mom",       label: "Mom",       emoji: "👩", category: "people", bg: "#FFF7ED" },
  { id: "people_dad",       label: "Dad",       emoji: "👨", category: "people", bg: "#FFF7ED" },
  { id: "people_teacher",   label: "Teacher",   emoji: "👩‍🏫", category: "people", bg: "#FFF7ED" },
  { id: "people_friend",    label: "Friend",    emoji: "🧑", category: "people", bg: "#FFF7ED" },
  { id: "people_nurse",     label: "Nurse",     emoji: "🩺", category: "people", bg: "#FFEDD5" },
  { id: "people_classmate", label: "Classmate", emoji: "👫", category: "people", bg: "#FFF7ED" },
  { id: "people_principal", label: "Principal", emoji: "💼", category: "people", bg: "#FFEDD5" },
  { id: "people_aide",      label: "Aide",      emoji: "🤗", category: "people", bg: "#FFEDD5" },

  // ── places (new category) ─────────────────────────────────────────────────
  { id: "places_classroom",  label: "Classroom",  emoji: "🏫", category: "places", bg: "#ECFDF5" },
  { id: "places_library",    label: "Library",    emoji: "📚", category: "places", bg: "#DCFCE7" },
  { id: "places_cafeteria",  label: "Cafeteria",  emoji: "🍽️", category: "places", bg: "#ECFDF5" },
  { id: "places_gym",        label: "Gym",        emoji: "🏃", category: "places", bg: "#DCFCE7" },
  { id: "places_playground", label: "Playground", emoji: "🛝", category: "places", bg: "#ECFDF5" },
  { id: "places_office",     label: "Office",     emoji: "🏢", category: "places", bg: "#DCFCE7" },
  { id: "places_bathroom",   label: "Bathroom",   emoji: "🚻", category: "places", bg: "#ECFDF5" },
  { id: "places_home",       label: "Home",       emoji: "🏠", category: "places", bg: "#DCFCE7" },
  { id: "places_hallway",    label: "Hallway",    emoji: "🚪", category: "places", bg: "#ECFDF5" },
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