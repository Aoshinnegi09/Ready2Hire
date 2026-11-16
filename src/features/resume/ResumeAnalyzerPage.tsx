import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Bot,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { orchestrateResumeAnalysis } from './agents/orchestrator';
import type { FullAnalysisReport } from './agents/types';
import { DEMO_JOBS } from '@/lib/mockData';
import { toast } from 'sonner';

const SAMPLE_STUDENT_RESUME = `ARAVIND KUMAR
aravind.k@college.edu | +91 98765 43210 | Chennai, India | https://github.com/aravind-k | https://linkedin.com/in/aravind-kumar-dev

EDUCATION
Bachelor of Technology in Computer Science and Engineering
National Institute of Technology | 2022 - 2026 | CGPA: 8.8 / 10.0

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, Java, SQL
Frameworks & Libraries: React, Node.js, Next.js, Express, Tailwind CSS
Databases & Cloud: PostgreSQL, Redis, MongoDB, Docker, Kubernetes, AWS (S3, EC2, Lambda)
Core Concepts: Data Structures & Algorithms, Distributed Systems, Microservices, CI/CD

EXPERIENCE
Software Engineering Intern | Razorpay Payments | May 2025 - July 2025
- Architected and deployed an asynchronous webhook retry service in Node.js and TypeScript, handling over 120,000 requests/day.
- Reduced PostgreSQL query latency by 38% through optimized composite B-Tree indexing and query plan restructuring.
- Built automated unit and integration test suites using Vitest, boosting branch code coverage from 64% to 92%.

PROJECTS
High-Throughput Distributed Task Queue (Go, Redis, Docker)
- Engineered a distributed worker queue processing 15,000 background jobs/sec with exponential backoff and dead-letter queues.
- Containerized microservices using multi-stage Docker builds, reducing container image size by 55%.

Cloud Hiring & Proctoring Assessment Platform (React 18, TypeScript, Supabase)
- Built a secure campus recruitment portal featuring client-side MediaPipe face tracking and Web Audio noise integrity checks.
- Implemented real-time Supabase Row Level Security (RLS) policies guaranteeing applicant-recruiter isolation.`;

export const ResumeAnalyzerPage: React.FC = () => {
  const [resumeText, setResumeText] = useState(SAMPLE_STUDENT_RESUME);
  const [jobDescription, setJobDescription] = useState(DEMO_JOBS[0].description + '\n\n' + DEMO_JOBS[0].requirements);
  const [targetTitle, setTargetTitle] = useState(DEMO_JOBS[0].title);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<FullAnalysisReport | null>(() => {
    // Run initial analysis with sample inputs so page renders populated
    return orchestrateResumeAnalysis({
      resumeText: SAMPLE_STUDENT_RESUME,
      jobDescriptionText: DEMO_JOBS[0].description + '\n\n' + DEMO_JOBS[0].requirements,
      requiredSkills: DEMO_JOBS[0].required_skills,
    });
  });

  const handleRunAnalysis = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Please provide both resume text and target job description.');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      try {
        const result = orchestrateResumeAnalysis({
          resumeText,
          jobDescriptionText: jobDescription,
          targetRoleTitle: targetTitle,
        });
        setReport(result);
        toast.success(`Analysis completed! Overall Match: ${result.overallScore}%`);
      } catch (err) {
        toast.error('Analysis failed. Please verify resume input formatting.');
      } finally {
        setIsAnalyzing(false);
      }
    }, 400);
  };

  const loadJobPreset = (jobIndex: number) => {
    const job = DEMO_JOBS[jobIndex];
    setTargetTitle(job.title);
    setJobDescription(job.description + '\n\n' + job.requirements);
    toast.info(`Loaded preset: ${job.title} (${job.company.name})`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              5-Agent Resume Alignment Engine
            </h1>
            <Badge variant="outline" className="border-emerald-600 text-emerald-600 font-mono text-[10px]">
              Multi-Agent Pipeline
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Deterministic evaluation orchestrating Parser, Skills Matcher, Experience Evaluator, ATS Checker, and Final Scorer agents.
          </p>
        </div>

        {/* Quick JD Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Target JD:</span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => loadJobPreset(0)}
          >
            Backend SDE
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => loadJobPreset(1)}
          >
            Frontend SDE
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => loadJobPreset(3)}
          >
            Full Stack
          </Button>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <FileText className="w-4 h-4 text-primary" />
                Resume Content (Text / Markdown)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-muted-foreground"
                onClick={() => setResumeText(SAMPLE_STUDENT_RESUME)}
              >
                Reset Sample
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste plain text extracted from your PDF resume..."
              className="font-mono text-xs leading-relaxed"
            />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Briefcase className="w-4 h-4 text-primary" />
                Job Description & Role Requirements
              </CardTitle>
              <span className="text-xs font-mono text-muted-foreground">{targetTitle}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Textarea
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job description and required technologies..."
              className="text-xs leading-relaxed"
            />
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              onClick={handleRunAnalysis}
              isLoading={isAnalyzing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Execute 5-Agent Pipeline
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Dashboard */}
      {report && (
        <div className="space-y-6 pt-4 border-t">
          {/* Main KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <Card className="border shadow-sm bg-gradient-to-b from-card to-muted/20 text-center">
              <CardHeader className="pb-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Overall Alignment
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-5xl font-black text-foreground">
                  <span className={report.overallScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}>
                    {report.overallScore}
                  </span>
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {report.overallScore >= 80
                    ? 'High Match Probability'
                    : 'Moderate Match — Edits Advised'}
                </div>
              </CardContent>
            </Card>

            {/* Skills Score */}
            <Card className="border shadow-sm text-center">
              <CardHeader className="pb-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Skills Match (45%)
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-extrabold text-foreground">
                  {report.agents.skillsMatcher.score}%
                </div>
                <Progress value={report.agents.skillsMatcher.score} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  {report.agents.skillsMatcher.data.matchedSkills.length} matching keywords
                </p>
              </CardContent>
            </Card>

            {/* Experience Score */}
            <Card className="border shadow-sm text-center">
              <CardHeader className="pb-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Experience Fit (25%)
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-extrabold text-foreground">
                  {report.agents.experienceEvaluator.score}%
                </div>
                <Progress value={report.agents.experienceEvaluator.score} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  Degree & project fit evaluated
                </p>
              </CardContent>
            </Card>

            {/* ATS Score */}
            <Card className="border shadow-sm text-center">
              <CardHeader className="pb-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  ATS Structure (20%)
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-extrabold text-foreground">
                  {report.agents.atsChecker.score}%
                </div>
                <Progress value={report.agents.atsChecker.score} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  Format & readability validated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Keywords Match Matrix */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Keyword Alignment Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-600 block mb-2">
                  Matched Skills & Competencies ({report.agents.skillsMatcher.data.matchedSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.agents.skillsMatcher.data.matchedSkills.map((skill: string) => (
                    <Badge key={skill} variant="success" className="capitalize text-xs font-mono">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {report.agents.skillsMatcher.data.missingRequiredSkills.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-destructive block mb-2">
                    Missing Target Skills ({report.agents.skillsMatcher.data.missingRequiredSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.agents.skillsMatcher.data.missingRequiredSkills.map((skill: string) => (
                      <Badge key={skill} variant="destructive" className="capitalize text-xs font-mono">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Per-Agent Breakdown Tabs */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Individual Agent Inspection & Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="final">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="final" className="text-xs">Final Scorer</TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs">Skills Matcher</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
                  <TabsTrigger value="ats" className="text-xs">ATS Checker</TabsTrigger>
                  <TabsTrigger value="parser" className="text-xs">Parser</TabsTrigger>
                </TabsList>

                <TabsContent value="final" className="pt-4 space-y-3">
                  <div className="text-xs space-y-2">
                    <div className="font-semibold text-foreground">Scoring Formula:</div>
                    <code className="block p-2 rounded bg-muted text-[11px] font-mono">
                      {report.agents.finalScorer.data.formulaExplanation}
                    </code>
                    <div className="font-semibold text-foreground pt-2">Prioritized Recommendations:</div>
                    <ul className="space-y-2">
                      {report.agents.finalScorer.data.prioritizedRecommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="p-3 rounded-lg border bg-muted/40 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{rec.title}</span>
                            <Badge variant={rec.category === 'High Priority' ? 'destructive' : 'secondary'} className="text-[10px]">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{rec.action}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="pt-4 space-y-2 text-xs">
                  <p className="text-muted-foreground">
                    Matches exact token occurrences and semantic synonyms using the internal canonical dictionary.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded bg-muted">
                      <span className="font-semibold">Coverage Ratio:</span>
                      <div className="text-lg font-bold font-mono">
                        {(report.agents.skillsMatcher.data.coverageRatio * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <span className="font-semibold">Execution Latency:</span>
                      <div className="text-lg font-bold font-mono">
                        {report.agents.skillsMatcher.executionTimeMs} ms
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="pt-4 space-y-2 text-xs">
                  <p className="text-muted-foreground">
                    Evaluates tenure length, project scale, and presence of quantifiable metrics.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    {report.agents.experienceEvaluator.data.highlights.map((h: string, idx: number) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="ats" className="pt-4 space-y-2 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Detected Standard Headings:</span>{' '}
                      {report.agents.atsChecker.data.detectedSections.join(', ')}
                    </div>
                    <div>
                      <span className="font-semibold">Quantified Bullet Score:</span>{' '}
                      {report.agents.atsChecker.data.quantifiedBulletPointsScore}%
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parser" className="pt-4 space-y-2 text-xs">
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>Extracted Name: {report.agents.parser.data.contact.fullName}</div>
                    <div>Email: {report.agents.parser.data.contact.email}</div>
                    <div>Links Found: {report.agents.parser.data.contact.links.length}</div>
                    <div>Raw Character Count: {report.agents.parser.data.rawTextLength}</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
