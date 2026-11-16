import type { ParsedResume, AgentResult, AtsCheckerOutput } from './types';

const REQUIRED_SECTIONS = ['education', 'skills', 'experience', 'projects'];

export function runAtsCheckerAgent(
  parsedResume: ParsedResume,
  rawResumeText: string = ''
): AgentResult<AtsCheckerOutput> {
  const startTime = performance.now();
  const lowerText = rawResumeText.toLowerCase();

  const detectedSections: string[] = [];
  const missingSections: string[] = [];
  const parsingRisks: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    if (lowerText.includes(section)) {
      detectedSections.push(section);
    } else {
      missingSections.push(section);
    }
  }

  // Section heading score
  const sectionHeadingsScore = Math.round(
    (detectedSections.length / REQUIRED_SECTIONS.length) * 100
  );

  // Length check (ideal range 300 - 1000 words for single-page student resume)
  const wordCount = rawResumeText.trim().split(/\s+/).length;
  let lengthScore = 90;
  if (wordCount < 150) {
    lengthScore = 50;
    parsingRisks.push('Resume is under 150 words; might appear sparse or uninformative to recruiters.');
  } else if (wordCount > 1200) {
    lengthScore = 70;
    parsingRisks.push('Resume exceeds 1200 words. For freshers and early engineers, a concise 1-page format is strongly recommended.');
  }

  // Check for quantified metrics in bullet points (% or numbers)
  const quantifiedMatches = rawResumeText.match(/\b\d+%\b|\b\d+\s?(?:ms|kb|mb|gb|req\/s|users|stars)\b/gi) || [];
  const quantifiedScore = Math.min(100, Math.max(40, quantifiedMatches.length * 15 + 40));

  // Readability & formatting risks
  let readabilityScore = 85;
  if (rawResumeText.includes('|') || rawResumeText.includes('•') || rawResumeText.includes('-')) {
    readabilityScore = 95;
  }

  // Overall ATS score
  const score = Math.round(
    sectionHeadingsScore * 0.40 +
    lengthScore * 0.20 +
    quantifiedScore * 0.25 +
    readabilityScore * 0.15
  );

  const suggestions: string[] = [];
  if (missingSections.length > 0) {
    suggestions.push(
      `Add standard section headings for ATS scanners: ${missingSections.map((s) => `"${s.toUpperCase()}"`).join(', ')}.`
    );
  }
  if (quantifiedMatches.length < 3) {
    suggestions.push(
      'Include at least 3-4 quantified achievements with clear percentage improvements or scale indicators.'
    );
  }
  if (parsingRisks.length > 0) {
    suggestions.push(parsingRisks[0]);
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    agentName: 'ATS / Format Checker Agent',
    score,
    weight: 0.15,
    data: {
      sectionHeadingsScore,
      readabilityScore,
      lengthScore,
      quantifiedBulletPointsScore: quantifiedScore,
      parsingRisks,
      detectedSections,
      missingSections,
    },
    suggestions,
    executionTimeMs,
  };
}
