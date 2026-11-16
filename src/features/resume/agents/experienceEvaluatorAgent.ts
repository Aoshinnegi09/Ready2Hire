import type { ParsedResume, AgentResult, ExperienceEvaluatorOutput } from './types';

export function runExperienceEvaluatorAgent(
  parsedResume: ParsedResume,
  requiredYears: number = 0
): AgentResult<ExperienceEvaluatorOutput> {
  const startTime = performance.now();

  const totalExperienceMonths = (parsedResume.experience || []).reduce(
    (acc, exp) => acc + (exp.durationMonths || 3),
    0
  );

  const degreeMatch = (parsedResume.education || []).some((edu) =>
    /b\.?tech|bachelor|computer science|engineering|information/i.test(
      `${edu.degree} ${edu.field}`
    )
  );

  // Project evaluation
  const projectCount = parsedResume.projects?.length || 0;
  const metricsFoundCount = (parsedResume.projects || []).filter(
    (p) => p.metricsFound
  ).length;

  let projectRelevanceScore = 60;
  if (projectCount >= 2) projectRelevanceScore += 20;
  if (metricsFoundCount > 0) projectRelevanceScore += 20;
  projectRelevanceScore = Math.min(100, projectRelevanceScore);

  // Experience fit calculation
  let experienceFitScore = 70;
  if (requiredYears === 0) {
    // Fresher / campus hiring role
    experienceFitScore = totalExperienceMonths >= 3 ? 95 : 80;
  } else {
    const candidateYears = totalExperienceMonths / 12;
    if (candidateYears >= requiredYears) {
      experienceFitScore = 95;
    } else {
      experienceFitScore = Math.max(40, Math.round((candidateYears / requiredYears) * 90));
    }
  }

  // Combined score (degree 25%, experience 40%, projects 35%)
  const score = Math.round(
    (degreeMatch ? 100 : 60) * 0.25 +
      experienceFitScore * 0.40 +
      projectRelevanceScore * 0.35
  );

  const suggestions: string[] = [];
  if (metricsFoundCount === 0) {
    suggestions.push(
      'Quantify project impact with specific metrics (e.g., "Reduced response latency by 40%", "Handled 10,000 requests/sec").'
    );
  }
  if (projectCount < 2) {
    suggestions.push(
      'Add at least 2 in-depth technical projects highlighting end-to-end architecture and modern tooling.'
    );
  }
  if (!degreeMatch) {
    suggestions.push(
      'Clarify your undergraduate degree or STEM coursework relevance to meet formal qualification filters.'
    );
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    agentName: 'Experience & Education Evaluator Agent',
    score,
    weight: 0.25,
    data: {
      totalExperienceMonths,
      requiredExperienceYears: requiredYears,
      experienceFitScore,
      degreeMatch,
      projectRelevanceScore,
      quantifiedAchievementsRatio: projectCount > 0 ? metricsFoundCount / projectCount : 0,
      highlights: [
        degreeMatch ? 'Accredited Computer Science / Engineering degree detected' : 'Non-traditional educational path',
        `${totalExperienceMonths} months verifiable internship / industry experience`,
        `${projectCount} featured engineering project(s)`,
      ],
    },
    suggestions,
    executionTimeMs,
  };
}
