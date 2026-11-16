import type {
  AgentResult,
  FinalScorerOutput,
  ParsedResume,
  SkillsMatcherOutput,
  ExperienceEvaluatorOutput,
  AtsCheckerOutput,
} from './types';

export function runFinalScorerAgent(
  parserResult: AgentResult<ParsedResume>,
  skillsResult: AgentResult<SkillsMatcherOutput>,
  expResult: AgentResult<ExperienceEvaluatorOutput>,
  atsResult: AgentResult<AtsCheckerOutput>
): AgentResult<FinalScorerOutput> {
  const startTime = performance.now();

  // Weighted formula
  // Skills Match: 45% (Highest weight for tech roles)
  // Experience & Education: 25%
  // ATS Compliance: 20%
  // Parser Completeness: 10%
  const parserScore = parserResult.score;
  const skillsScore = skillsResult.score;
  const experienceScore = expResult.score;
  const atsScore = atsResult.score;

  const rawOverall =
    parserScore * 0.10 +
    skillsScore * 0.45 +
    experienceScore * 0.25 +
    atsScore * 0.20;

  const overallScore = Math.round(Math.min(100, Math.max(0, rawOverall)));

  // Aggregate and prioritize recommendations
  const prioritizedRecommendations: FinalScorerOutput['prioritizedRecommendations'] = [];

  // High priority: missing core skills or major ATS faults
  if (skillsResult.data.missingRequiredSkills.length > 0) {
    prioritizedRecommendations.push({
      category: 'High Priority',
      title: 'Address Critical Skill Deficits',
      action: `Incorporate explicit keywords for: ${skillsResult.data.missingRequiredSkills
        .slice(0, 3)
        .join(', ')} into your experience or project sections.`,
    });
  }

  if (atsResult.data.missingSections.length > 0) {
    prioritizedRecommendations.push({
      category: 'High Priority',
      title: 'Fix Missing ATS Sections',
      action: `Add standard headings for ${atsResult.data.missingSections
        .map((s) => s.toUpperCase())
        .join(', ')} so automated parsers do not discard the file.`,
    });
  }

  // Medium priority: quantification and degree clarification
  if (expResult.data.quantifiedAchievementsRatio < 0.5) {
    prioritizedRecommendations.push({
      category: 'Medium Priority',
      title: 'Quantify Engineering Impact',
      action: 'Rewrite project bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".',
    });
  }

  // Low priority: formatting, styling, links
  if (!parserResult.data.contact.links.length) {
    prioritizedRecommendations.push({
      category: 'Low Priority',
      title: 'Add Verification Links',
      action: 'Include clickable links to your live GitHub, LinkedIn profile, or deployed project demos.',
    });
  }

  const formulaExplanation =
    'Overall Score (0-100) = (Parser: 10%) + (Skills Match: 45%) + (Experience & Projects: 25%) + (ATS Formatting: 20%). Fully deterministic rule-based evaluation.';

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    agentName: 'Final Scorer & Recommendation Agent',
    score: overallScore,
    weight: 1.0,
    data: {
      overallScore,
      breakdown: {
        parserScore,
        skillsScore,
        experienceScore,
        atsScore,
      },
      formulaExplanation,
      prioritizedRecommendations,
    },
    suggestions: prioritizedRecommendations.map((r) => r.action),
    executionTimeMs,
  };
}
