import { describe, it, expect } from 'vitest';
import { runParserAgent } from '../parserAgent';
import { runSkillsMatcherAgent } from '../skillsMatcherAgent';
import { runAtsCheckerAgent } from '../atsCheckerAgent';
import { runExperienceEvaluatorAgent } from '../experienceEvaluatorAgent';
import { runFinalScorerAgent } from '../finalScorerAgent';

const SAMPLE_RESUME = `
ARAVIND KUMAR
aravind.k@college.edu | +91 98765 43210
EDUCATION
Bachelor of Technology in Computer Science and Engineering
National Institute of Technology | 2022 - 2026 | CGPA: 8.8
SKILLS
Languages: TypeScript, JavaScript, Python, Go, Java, SQL
Frameworks: React, Node.js, Express
Databases: PostgreSQL, Redis, Docker, Kubernetes
EXPERIENCE
Software Engineering Intern | Tech Corp | 2025
- Reduced query latency by 35% on high volume tables.
PROJECTS
Distributed Task Queue | Go, Redis, Docker
- Handled 10,000 requests per second with 99.9% uptime.
`;

describe('5-Agent Resume Analyzer Suite', () => {
  it('Parser Agent extracts contact details and technical skills accurately', () => {
    const parserResult = runParserAgent(SAMPLE_RESUME);
    expect(parserResult.score).toBeGreaterThan(70);
    expect(parserResult.data.contact.email).toBe('aravind.k@college.edu');
    expect(parserResult.data.skills.technical).toContain('react');
    expect(parserResult.data.skills.technical).toContain('typescript');
  });

  it('Skills Matcher Agent detects exact and synonym skills with coverage ratio', () => {
    const parserResult = runParserAgent(SAMPLE_RESUME);
    const skillsResult = runSkillsMatcherAgent(
      parserResult.data,
      'Looking for a Frontend Engineer with React, TypeScript, and Docker skills.',
      ['React', 'TypeScript', 'Docker']
    );

    expect(skillsResult.score).toBe(100);
    expect(skillsResult.data.matchedSkills.length).toBe(3);
    expect(skillsResult.data.missingRequiredSkills.length).toBe(0);
  });

  it('Skills Matcher Agent identifies missing keywords', () => {
    const parserResult = runParserAgent(SAMPLE_RESUME);
    const skillsResult = runSkillsMatcherAgent(
      parserResult.data,
      'Requires Rust and Ruby on Rails development background.',
      ['Rust', 'Ruby']
    );

    expect(skillsResult.score).toBe(0);
    expect(skillsResult.data.missingRequiredSkills).toContain('rust');
    expect(skillsResult.data.missingRequiredSkills).toContain('ruby');
  });

  it('ATS Checker Agent verifies section headings and readability', () => {
    const parserResult = runParserAgent(SAMPLE_RESUME);
    const atsResult = runAtsCheckerAgent(parserResult.data, SAMPLE_RESUME);

    expect(atsResult.score).toBeGreaterThan(70);
    expect(atsResult.data.detectedSections).toContain('education');
    expect(atsResult.data.detectedSections).toContain('skills');
    expect(atsResult.data.detectedSections).toContain('experience');
    expect(atsResult.data.detectedSections).toContain('projects');
  });

  it('Final Scorer Agent combines scores using exact weighted formula', () => {
    const parserResult = runParserAgent(SAMPLE_RESUME);
    const skillsResult = runSkillsMatcherAgent(
      parserResult.data,
      'Looking for React and TypeScript',
      ['React', 'TypeScript']
    );
    const expResult = runExperienceEvaluatorAgent(parserResult.data, 0);
    const atsResult = runAtsCheckerAgent(parserResult.data, SAMPLE_RESUME);

    const finalResult = runFinalScorerAgent(
      parserResult,
      skillsResult,
      expResult,
      atsResult
    );

    // Formula: parser * 0.10 + skills * 0.45 + exp * 0.25 + ats * 0.20
    const expected = Math.round(
      parserResult.score * 0.10 +
      skillsResult.score * 0.45 +
      expResult.score * 0.25 +
      atsResult.score * 0.20
    );

    expect(finalResult.score).toBe(expected);
    expect(finalResult.data.prioritizedRecommendations).toBeDefined();
  });
});
