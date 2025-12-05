export enum Tab {
  CURRICULUM = 'CURRICULUM',
  KANBAN = 'KANBAN',
  SETTINGS = 'SETTINGS',
  LOG = 'LOG',
  FORGE = 'FORGE',
  PATCHES = 'PATCHES',
  CAREER = 'CAREER'
}

export enum SkillCategory {
  SQL = 'SQL',
  AGILE = 'AGILE',
  STRATEGY = 'STRATEGY',
  EXCEL = 'EXCEL'
}

export type ChatMode = 'STANDARD' | 'THINKING' | 'SEARCH';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  xp: number;
  time: string;
  category: SkillCategory;
  subTasks?: SubTask[];
}

export interface Day {
  id: number;
  title: string;
  theme: string;
  tasks: Task[];
  isVerified?: boolean; // True if Daily Debrief passed
}

export enum KanbanStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE'
}

export interface KanbanItem {
  id: string;
  title: string;
  status: KanbanStatus;
}

export interface BrainDumpItem {
  id: string;
  text: string;
  timestamp: number;
}

// --- New Types for Features ---

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface JournalEntry {
  id: string;
  originalText: string;
  summary: {
    insight: string;
    action: string;
    concept: string;
  };
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'DIVER' | 'TIME' | 'SQL' | 'STREAK' | 'FIRST';
}

export interface CareerState {
  resumeDraft: string;
  interviewStats: {
    questionsAnswered: number;
    lastScore: number;
  };
}

export interface UserState {
  xp: number;
  level: number;
  completedTaskIds: string[];
  kanbanItems: KanbanItem[];
  skills: Record<SkillCategory, number>;
  brainDump: BrainDumpItem[];
  
  // Feature State Fields
  verifiedDayIds: number[]; // Days passed via Debrief
  journal: JournalEntry[];
  unlockedAchievements: string[];
  career: CareerState;
  stats: {
    aiUsageCount: number;
    pomodoroCount: number;
    daysCompletedCount: number;
  };
}

export interface PomodoroState {
  timeLeft: number; // in seconds
  isActive: boolean;
  mode: 'FOCUS' | 'BREAK';
}