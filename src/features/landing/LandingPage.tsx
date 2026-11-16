import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Shield,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  FileCheck2,
  Users,
  Search,
  Lock,
} from 'lucide-react';
import { DEMO_JOBS, DEMO_TRACKS } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section: Precision Engineering Aesthetic */}
      <section className="relative pt-16 pb-12 border-b border-border/80 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/60 text-xs font-medium text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engineered for B.Tech CSE Campus Placement Drives</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Standardized skill grading, automated ATS alignment, and tamper-evident exam proctoring.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Ready2Hire bridges college graduates and tech employers through deterministic 5-agent resume matching, server-side validated code assessments, and client-side machine learning integrity monitoring.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/applicant">
                <Button size="lg" className="h-11 px-6 text-sm font-medium">
                  Enter Student Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/recruiter">
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium">
                  Recruiter Console
                </Button>
              </Link>
              <Link to="/setup-guide">
                <Button size="lg" variant="ghost" className="h-11 px-4 text-sm text-muted-foreground">
                  View Supabase Architecture
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Live Mockup Card */}
          <div className="rounded-xl border bg-card/95 shadow-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <span className="text-muted-foreground font-mono ml-2">ready2hire.internal/evaluator/stream</span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                5-AGENT PIPELINE: ACTIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-semibold">1. Resume Match</span>
                <div className="text-xl font-bold text-emerald-600">92% Match</div>
                <p className="text-[11px] text-muted-foreground">Go, React, Distributed Systems</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-semibold">2. Server-Side Test</span>
                <div className="text-xl font-bold text-foreground">Grade A+ (93.3%)</div>
                <p className="text-[11px] text-muted-foreground">Advanced DSA & Complexity</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-semibold">3. Proctoring Verification</span>
                <div className="text-xl font-bold text-emerald-600">8.5/100 Risk</div>
                <p className="text-[11px] text-muted-foreground">Zero anomalies • Face centered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Proposition for Both Stakeholders */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Built for Two Sided Verification
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Eliminating resume embellishments and opaque recruitment screening with verifiable proof of work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Pillar */}
          <Card className="border shadow-sm p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">For Students & Graduates</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Take the guesswork out of job applications with transparent feedback and verifiable proof of skill.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>5-Agent Resume Analyzer:</strong> Instant audit across formatting, keyword density, and experience metrics before applying.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Standardized Skill Tests:</strong> Take 30-minute DSA, Web, and Core CS tests and earn tamper-evident grade bands.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Application Tracker:</strong> Real-time pipeline status updates directly from visiting corporate recruiters.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/applicant">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Access Student Workspace
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recruiter Pillar */}
          <Card className="border shadow-sm p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">For University Recruiters</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Source candidates filtered by true code capability and authenticated examination logs.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Holistic Candidate Scores:</strong> View match %, resume score, verified code test grade, and proctoring risk in one table.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Proctoring Audit Trail:</strong> Review timestamped violation events, face presence telemetry, and snapshot evidence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Side-by-Side Comparison:</strong> Compare 2-3 shortlisted students across granular topic breakdowns.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/recruiter">
                <Button size="sm" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  Open Recruiter Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Featured Openings Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Active Campus Hiring Drives
            </h2>
            <p className="text-xs text-muted-foreground">
              Verified corporate hiring partners with active test assignment pipelines.
            </p>
          </div>
          <Link to="/jobs">
            <Button size="sm" variant="ghost" className="text-xs">
              View All Jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_JOBS.slice(0, 3).map((job) => (
            <Card key={job.id} className="border shadow-sm p-4 space-y-3 hover:border-primary/50 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{job.company.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{job.work_mode}</Badge>
                </div>
                <h3 className="font-bold text-sm text-foreground">{job.title}</h3>
                <div className="text-xs font-semibold text-foreground">
                  {formatCurrency(job.min_salary)} - {formatCurrency(job.max_salary)}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <Badge variant="success" className="text-[10px] font-mono">
                  {job.match_percentage}% Match
                </Badge>
                <Link to={`/jobs/${job.id}`}>
                  <Button size="sm" className="h-7 text-xs">
                    Apply Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
