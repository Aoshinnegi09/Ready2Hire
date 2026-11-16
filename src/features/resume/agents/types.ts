export interface ParsedResume {
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
    grade?: string;
  }>;
  skills: {
    technical: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    softSkills: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    period: string;
    durationMonths: number;
    description: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    metricsFound: boolean;
  }>;
  rawTextLength: number;
}

export interface AgentResult<T = any> {
  agentName: string;
  score: number; // 0-100
  weight: number;
  data: T;
  suggestions: string[];
  executionTimeMs: number;
}

export interface SkillsMatcherOutput {
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingNiceToHaveSkills: string[];
  synonymMatches: Array<{ resumeSkill: string; jdSkill: string }>;
  exactMatchCount: number;
  totalJdSkillsCount: number;
  coverageRatio: number;
}

export interface ExperienceEvaluatorOutput {
  totalExperienceMonths: number;
  requiredExperienceYears: number;
  experienceFitScore: number;
  degreeMatch: boolean;
  projectRelevanceScore: number;
  quantifiedAchievementsRatio: number;
  highlights: string[];
}

export interface AtsCheckerOutput {
  sectionHeadingsScore: number;
  readabilityScore: number;
  lengthScore: number;
  quantifiedBulletPointsScore: number;
  parsingRisks: string[];
  detectedSections: string[];
  missingSections: string[];
}

export interface FinalScorerOutput {
  overallScore: number;
  breakdown: {
    parserScore: number;
    skillsScore: number;
    experienceScore: number;
    atsScore: number;
  };
  formulaExplanation: string;
  prioritizedRecommendations: Array<{
    category: 'High Priority' | 'Medium Priority' | 'Low Priority';
    title: string;
    action: string;
  }>;
}

export interface FullAnalysisReport {
  id: string;
  overallScore: number;
  summary: string;
  timestamp: string;
  agents: {
    parser: AgentResult<ParsedResume>;
    skillsMatcher: AgentResult<SkillsMatcherOutput>;
    experienceEvaluator: AgentResult<ExperienceEvaluatorOutput>;
    atsChecker: AgentResult<AtsCheckerOutput>;
    finalScorer: AgentResult<FinalScorerOutput>;
  };
}
