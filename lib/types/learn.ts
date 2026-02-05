// HanapBuhay Learn Page Types

export interface SkillScore {
  category: string;
  userCount: number;
  totalCount: number;
  percentage: number;
}

export interface SkillsSnapshot {
  scores: SkillScore[];
  overallPercentage: number;
  topRecommendation: string;
}

export interface LearningStep {
  title: string;
  description: string;
  completed: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  level: "beginner" | "intermediate" | "advanced";
  steps: LearningStep[];
  jobsUnlocked: number;
  estimatedHours: number;
  color: string;
  colorBg: string;
  colorBorder: string;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  skillTags: string[];
}

export interface QuizResult {
  score: number;
  total: number;
  completedAt: string;
  questionIds?: string[];
  answers?: number[];
}

export interface SkillAssessment {
  id: string;
  categoryId: string;
  categoryName: string;
  icon: string;
  skillCount: number;
  questions: QuizQuestion[];
  color: string;
  colorBg: string;
}

export interface AssessmentResultRow {
  id: string;
  user_id: string;
  category_id: string;
  score: number;
  total: number;
  question_ids: string[];
  answers: number[];
  experience_level: string;
  completed_at: string;
  created_at: string;
}

export interface QuickWin {
  id: string;
  skill: string;
  estimatedMinutes: number;
  jobsUnlocked: number;
  resourceUrl: string;
  resourceLabel: string;
  icon: string;
}

export interface FreeResource {
  id: string;
  provider: string;
  letter: string;
  logoBg: string;
  logoColor: string;
  logoUrl?: string | null;
  description: string;
  category: string;
  url: string;
}

export interface LearningActivity {
  type: "assessment" | "resource" | "skill" | "path";
  text: string;
  time: string;
  icon: string;
}
