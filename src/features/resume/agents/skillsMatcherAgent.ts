import type { ParsedResume, AgentResult, SkillsMatcherOutput } from './types';

// Synonym dictionary mapping common variants to canonical terms
const SYNONYM_MAP: Record<string, string[]> = {
  'react': ['reactjs', 'react.js', 'react 18'],
  'node.js': ['nodejs', 'node', 'express.js'],
  'postgresql': ['postgres', 'psql', 'postgres db'],
  'golang': ['go', 'go lang'],
  'javascript': ['js', 'es6', 'ecmascript'],
  'typescript': ['ts'],
  'docker': ['containerization', 'containers'],
  'kubernetes': ['k8s'],
  'ci/cd': ['github actions', 'gitlab ci', 'jenkins'],
  'aws': ['amazon web services', 's3', 'ec2'],
  'distributed systems': ['microservices', 'distributed architecture'],
  'algorithms': ['data structures', 'dsa', 'problem solving'],
};

export function runSkillsMatcherAgent(
  parsedResume: ParsedResume,
  jobDescriptionText: string,
  requiredSkillsFromJob: string[] = []
): AgentResult<SkillsMatcherOutput> {
  const startTime = performance.now();
  const lowerJd = (jobDescriptionText || '').toLowerCase();
  const resumeSkills = new Set(
    (parsedResume.skills.technical || []).map((s) => s.toLowerCase())
  );

  // Derive target skills from explicitly passed list or by scanning the JD text
  let targetSkills = requiredSkillsFromJob.map((s) => s.toLowerCase());
  if (targetSkills.length === 0) {
    const defaultSearchSkills = [
      'react', 'typescript', 'javascript', 'node.js', 'python', 'java', 'golang',
      'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'algorithms', 'distributed systems'
    ];
    targetSkills = defaultSearchSkills.filter((s) => lowerJd.includes(s));
  }

  if (targetSkills.length === 0) {
    targetSkills = ['react', 'typescript', 'node.js', 'sql'];
  }

  const matchedSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const synonymMatches: Array<{ resumeSkill: string; jdSkill: string }> = [];

  for (const jdSkill of targetSkills) {
    // 1. Exact match in resume skills
    if (resumeSkills.has(jdSkill)) {
      matchedSkills.push(jdSkill);
      continue;
    }

    // 2. Synonym match
    const synonyms = SYNONYM_MAP[jdSkill] || [];
    let foundSynonym = false;
    for (const syn of synonyms) {
      if (resumeSkills.has(syn)) {
        synonymMatches.push({ resumeSkill: syn, jdSkill });
        matchedSkills.push(jdSkill);
        foundSynonym = true;
        break;
      }
    }

    if (!foundSynonym) {
      missingRequiredSkills.push(jdSkill);
    }
  }

  const exactMatchCount = matchedSkills.length;
  const totalJdSkillsCount = targetSkills.length;
  const coverageRatio = totalJdSkillsCount > 0 ? exactMatchCount / totalJdSkillsCount : 1;

  // Compute 0-100 score
  let score = Math.round(coverageRatio * 100);
  if (score > 100) score = 100;

  const suggestions: string[] = [];
  if (missingRequiredSkills.length > 0) {
    suggestions.push(
      `Add missing target skills mentioned in the JD: ${missingRequiredSkills
        .slice(0, 4)
        .map((s) => `"${s.toUpperCase()}"`)
        .join(', ')}.`
    );
  }
  if (synonymMatches.length > 0) {
    suggestions.push(
      `Consider standardizing synonyms: for instance, mention "${synonymMatches[0].jdSkill}" explicitly alongside "${synonymMatches[0].resumeSkill}".`
    );
  }
  if (coverageRatio >= 0.8) {
    suggestions.push('High skill density detected. Great keyword alignment with the target role.');
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    agentName: 'Skills Matcher Agent',
    score,
    weight: 0.35,
    data: {
      matchedSkills,
      missingRequiredSkills,
      missingNiceToHaveSkills: [],
      synonymMatches,
      exactMatchCount,
      totalJdSkillsCount,
      coverageRatio,
    },
    suggestions,
    executionTimeMs,
  };
}
