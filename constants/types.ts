export type StudentStatus = "online" | "idle" | "request" | "urgent";

export interface Student {
  id: number;
  name: string;
  status: StudentStatus;
  bg: string;
  color: string;
}

export interface AACIcon {
  id: string;
  label: string;
  emoji: string;
  category: AACCategory;
  bg: string;
}

export type AACCategory =
  | "all"
  | "needs"
  | "emotions"
  | "classroom"
  | "actions";

export interface CCLine {
  text: string;
  time: string;
  speaker: "teacher" | "aac";
}

// 💥 Added the User interface here to match FastAPI
export interface User {
  id: number;
  username: string;
  email: string;
  status: "STUDENT" | "TEACHER"; 
  first_name?: string;
  last_name?: string;
  bio?: string;
  
  // Student Specific
  grade_level?: string;
  disability_type?: string;

  // Teacher Specific
  display_name?: string;
  contact_number?: string;
  room_section?: string;
  department?: string;
  grade_handled?: string;
  organization?: string;
}