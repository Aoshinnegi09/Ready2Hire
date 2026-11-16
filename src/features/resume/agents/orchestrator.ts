import { runParserAgent } from './parserAgent';
import { runSkillsMatcherAgent } from './skillsMatcherAgent';
import { runExperienceEvaluatorAgent } from './experienceEvaluatorAgent';
import { runAtsCheckerAgent } from './atsCheckerAgent';
import { runFinalScorerAgent } from './finalScorerAgent';
import type { FullAnalysisReport } from './types';

export interface AnalysisInput {
  resumeText: string;
  jobDescriptionText: string;
  targetRoleTitle?: string;
  requiredSkills?: string[];
  requiredYears?: number;
}

export function orchestrateResumeAnalysis(input: AnalysisInput): FullAnalysisReport {
  const { resumeText, jobDescriptionText, requiredSkills, requiredYears } = input;

  // 1. Parser Agent
  const parserOutput = runParserAgent(resumeText);

  // 2. Skills Matcher Agent
  const skillsOutput = runSkillsMatcherAgent(
    parserOutput.data,
    jobDescriptionText,
    requiredSkills || []
  );

  // 3. Experience & Education Evaluator Agent
  const expOutput = runExperienceEvaluatorAgent(
    parserOutput.data,
    requiredYears ?? 0
  );

  // 4. ATS / Format Checker Agent
  const atsOutput = runAtsCheckerAgent(parserOutput.data, resumeText);

  // 5. Final Scorer & Recommendation Agent
  const finalOutput = runFinalScorerAgent(
    parserOutput,
    skillsOutput,
    expOutput,
    atsOutput
  );

  const summary = `Resume matched with ${finalOutput.score}% overall alignment for the target position. ${skillsOutput.data.matchedSkills.length} matching core skills identified with ${atsOutput.score}% ATS formatting compliance.`;

  return {
    id: `analysis-${Date.now()}`,
    overallScore: finalOutput.score,
    summary,
    timestamp: new Date().toISOString(),
    agents: {
      parser: parserOutput,
      skillsMatcher: skillsOutput,
      experienceEvaluator: expOutput,
      atsChecker: atsOutput,
      finalScorer: finalOutput,
    },
  };
}
