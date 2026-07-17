export interface User {
  id: string;
  name: string;
  email: string;
  is_google_account: boolean;
}

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Course {
  id: string;
  name: string;
  course_code: string | null;
  description: string | null;
  status: ProcessingStatus;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
}

export type PriorityLevel = "high" | "medium" | "low";

export interface Topic {
  id: string;
  title: string;
  priority: PriorityLevel;
  pyq_frequency: number;
  is_covered_in_notes: boolean;

  // NEW
  completed: boolean;

  reasoning: string | null;
  order_index: number;
}

export interface ImportantQuestion {
  id: string;
  question: string;
  answer: string;
  topic_title: string | null;
  frequency: number;
}

export interface Diagram {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  source_file: string | null;
  page_number: number | null;
}

export interface ShortNote {
  id: string;
  topic_title: string;
  content_markdown: string;
  order_index: number;
}

export interface DashboardData {
  topics: Topic[];
  questions: ImportantQuestion[];
  diagrams: Diagram[];
  short_notes: ShortNote[];

  coverage_percent: number;
  missing_topics: string[];

  total_topics: number;
  completed_topics: number;
  syllabus_progress: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}