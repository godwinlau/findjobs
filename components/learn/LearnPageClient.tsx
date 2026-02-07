"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InsightHero } from "./InsightHero";
import { SkillGapsSection } from "./SkillGapsSection";
import { DemandTrendsSection } from "./DemandTrendsSection";
import { MatchPotentialBlock } from "./MatchPotentialBlock";
import { YourSkillsBlock } from "./YourSkillsBlock";
import { QuickActionsBlock } from "./QuickActionsBlock";
import { AssessmentQuizModal } from "./AssessmentQuizModal";
import type { InsightHeroData, MatchProgression, MatchPotentialData, DemandTrend, UserSkillBar, GapResourceLink } from "@/lib/learn-page-helpers";
import type { SkillROI, SkillAssessment, QuizResult } from "@/lib/types/learn";

interface LearnPageClientProps {
  heroData: InsightHeroData;
  skillROIs: SkillROI[];
  resourceLinksMap: Record<string, GapResourceLink[]>;
  matchProgression: {
    items: MatchProgression[];
    currentPct: number;
    fullPotentialPct: number;
  };
  matchPotential: MatchPotentialData | null;
  demandTrends: DemandTrend[];
  userSkillBars: UserSkillBar[];
  assessments: SkillAssessment[];
  initialResults: Record<string, QuizResult>;
}

export function LearnPageClient({
  heroData,
  skillROIs,
  resourceLinksMap,
  matchProgression,
  matchPotential,
  demandTrends,
  userSkillBars,
  assessments,
  initialResults,
}: LearnPageClientProps) {
  const router = useRouter();
  const [activeQuiz, setActiveQuiz] = useState<SkillAssessment | null>(null);
  const [results, setResults] = useState<Record<string, QuizResult>>(initialResults);

  const handleComplete = useCallback(
    (result: QuizResult) => {
      if (!activeQuiz) return;
      setResults((prev) => ({ ...prev, [activeQuiz.categoryId]: result }));
    },
    [activeQuiz]
  );

  const handleTakeAssessment = useCallback(() => {
    // Open the first assessment that hasn't been completed, or the first one
    const unfinished = assessments.find((a) => !results[a.categoryId]);
    const target = unfinished ?? assessments[0];
    if (target) {
      if (results[target.categoryId]) {
        router.refresh();
      }
      setActiveQuiz(target);
    }
  }, [assessments, results, router]);

  return (
    <>
      <InsightHero data={heroData} matchPotential={matchPotential} />

      <div className="learn-two-col">
        {/* Main column */}
        <div>
          <SkillGapsSection
            skillROIs={skillROIs}
            resourceLinksMap={resourceLinksMap}
          />
          <DemandTrendsSection trends={demandTrends} />
        </div>

        {/* Sidebar */}
        <div>
          <MatchPotentialBlock
            items={matchProgression.items}
            currentPct={matchProgression.currentPct}
            fullPotentialPct={matchProgression.fullPotentialPct}
            matchPotential={matchPotential}
          />
          <YourSkillsBlock skills={userSkillBars} />
          <QuickActionsBlock onTakeAssessment={handleTakeAssessment} />
        </div>
      </div>

      {activeQuiz && (
        <AssessmentQuizModal
          assessment={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
