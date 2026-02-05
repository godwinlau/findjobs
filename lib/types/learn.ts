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

// ─── Course Recommendation Types ───

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerLetter: string;
  providerLogoBg: string;
  providerLogoColor: string;
  url: string;
  skillsTaught: string[];
  categoryId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  industries: string[];
  estimatedHours: number;
  format: "video" | "interactive" | "reading" | "project";
  isFree: boolean;
  icon: string;
}

export interface ScoredCourse extends Course {
  relevanceScore: number;
  reasons: string[];
  jobsUnlocked: number;
  skillGapsCovered: string[];
}

export interface SkillROI {
  skill: string;
  category: string;
  jobsRequiring: number;
  estimatedNewMatches: number;
  topIndustries: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  recommendedCourse: Course | null;
}

export interface RecommendationContext {
  userSkills: string[];
  experienceLevel: string;
  preferredIndustries: string[];
  snapshot: SkillsSnapshot;
  assessmentResults: Record<string, { score: number; total: number }>;
  allSkillsByCategory: Record<string, string[]>;
}

export interface ScoredLearningPath extends LearningPath {
  relevanceScore: number;
  isTopPick: boolean;
}

export interface ScoredQuickWin extends QuickWin {
  isTopPick: boolean;
  relevanceScore: number;
}

export interface ScoredFreeResource extends FreeResource {
  relevanceScore: number;
  isBestForGaps: boolean;
}
