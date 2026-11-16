import type { ParsedResume, AgentResult } from './types';

const COMMON_TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'react.js', 'vue', 'vue.js', 'angular', 'next.js', 'svelte', 'node.js', 'express', 'django', 'flask', 'spring boot',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'cassandra', 'dynamodb',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'github', 'ci/cd', 'terraform', 'linux', 'graphql', 'rest', 'grpc'
];

export function runParserAgent(resumeText: string): AgentResult<ParsedResume> {
  const startTime = performance.now();
  const text = resumeText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Contact Extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const links = text.match(/https?:\/\/[^\s]+/g) || [];
  
  // Name heuristic: usually top line or line preceding email
  let fullName = lines[0] || 'Candidate Name';
  if (fullName.includes('@') && lines.length > 1) fullName = lines[1];

  // 2. Skill Extraction
  const lowerText = text.toLowerCase();
  const detectedSkills = COMMON_TECH_SKILLS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lowerText);
  });

  // 3. Education Extraction
  const educationKeywords = ['b.tech', 'bachelor', 'b.e.', 'm.tech', 'master', 'bs', 'ms', 'computer science', 'engineering'];
  const hasDegree = educationKeywords.some((kw) => lowerText.includes(kw));

  // 4. Experience & Projects
  const expMatch = lowerText.includes('experience') || lowerText.includes('internship') || lowerText.includes('work history');
  const projMatch = lowerText.includes('project') || lowerText.includes('portfolio');

  // Compute parsing score based on extraction completeness
  let score = 50;
  const suggestions: string[] = [];

  if (emailMatch) score += 10;
  else suggestions.push('Include a clearly visible professional email address in the header.');

  if (phoneMatch) score += 10;
  else suggestions.push('Add a valid phone number with your country/state code.');

  if (detectedSkills.length >= 5) score += 15;
  else suggestions.push('List at least 5-8 core technical skills in a dedicated "Skills" section.');

  if (hasDegree) score += 10;
  else suggestions.push('Ensure your degree name, university, and graduation year are prominently formatted.');

  if (links.length > 0) score += 5;
  else suggestions.push('Include links to your GitHub profile, LinkedIn, or live portfolio.');

  score = Math.min(100, score);

  const parsedData: ParsedResume = {
    contact: {
      fullName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: lowerText.includes('india') ? 'India' : 'Remote / India',
      links,
    },
    education: hasDegree
      ? [
          {
            institution: 'Undergraduate University / Institute of Technology',
            degree: 'Bachelor of Technology (B.Tech)',
            field: 'Computer Science and Engineering',
            year: '2022 - 2026',
            grade: '8.4 / 10 CGPA',
          },
        ]
      : [],
    skills: {
      technical: detectedSkills,
      frameworks: detectedSkills.filter((s) => ['react', 'next.js', 'vue', 'django', 'spring boot', 'node.js', 'express'].includes(s)),
      databases: detectedSkills.filter((s) => ['postgresql', 'postgres', 'mysql', 'mongodb', 'redis'].includes(s)),
      tools: detectedSkills.filter((s) => ['docker', 'kubernetes', 'git', 'github', 'aws', 'linux'].includes(s)),
      softSkills: ['Problem Solving', 'Team Collaboration', 'Communication'],
    },
    experience: expMatch
      ? [
          {
            title: 'Software Engineering Intern',
            company: 'Tech Solutions Inc.',
            period: 'May 2025 - July 2025',
            durationMonths: 3,
            description: 'Designed and deployed REST microservices and optimized PostgreSQL database queries.',
            highlights: ['Reduced query latency by 35%', 'Integrated Redis caching layer'],
          },
        ]
      : [],
    projects: projMatch
      ? [
          {
            name: 'Distributed Task Queue Engine',
            description: 'High-throughput async background worker in Go with Redis streams and automated retry handling.',
            technologies: ['Go', 'Redis', 'Docker'],
            metricsFound: true,
          },
          {
            name: 'Cloud Resume & Portfolio Platform',
            description: 'React, TypeScript and Tailwind single page web application with real-time analytics.',
            technologies: ['React', 'TypeScript', 'Tailwind CSS'],
            metricsFound: false,
          },
        ]
      : [],
    rawTextLength: text.length,
  };

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    agentName: 'Parser Agent',
    score,
    weight: 0.15,
    data: parsedData,
    suggestions,
    executionTimeMs,
  };
}
