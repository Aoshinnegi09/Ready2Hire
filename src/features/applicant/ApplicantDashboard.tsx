import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { DEMO_APPLICATIONS, DEMO_TEST_ATTEMPTS, DEMO_JOBS, DEMO_TRACKS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  FileText,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const ApplicantDashboard: React.FC = () => {
  const { user } = useAuth();

  const applications = DEMO_APPLICATIONS;
  const testAttempts = DEMO_TEST_ATTEMPTS.filter((a) => a.user_id === 'usr-student-01');
  const recommendedJobs = DEMO_JOBS.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'}!
            </h1>
            <Badge variant="outline" className="border-emerald-600 text-emerald-600 font-mono text-[10px]">
              Verified Candidate
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Overview of your placement candidacies, skill test certifications, and resume scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/resume-analyzer">
            <Button size="sm" variant="outline" className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Resume Analyzer
            </Button>
          </Link>
          <Link to="/tests">
            <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Take Skill Test
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Active Applications</span>
          <div className="text-2xl font-bold text-foreground">{applications.length}</div>
          <p className="text-[10px] text-muted-foreground">1 Interview • 1 Offer</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Latest Resume Score</span>
          <div className="text-2xl font-bold text-emerald-600">92/100</div>
          <p className="text-[10px] text-muted-foreground">5-Agent Verified ATS</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Verified Skill Badges</span>
          <div className="text-2xl font-bold text-foreground">{testAttempts.length}</div>
          <p className="text-[10px] text-muted-foreground">Top: Grade A+ (DSA)</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Proctoring Standing</span>
          <div className="text-2xl font-bold text-emerald-600">CLEAN</div>
          <p className="text-[10px] text-muted-foreground">Low Integrity Risk (&lt;10%)</p>
        </Card>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Applications & Test Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Applications */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Recent Applications
              </CardTitle>
              <Link to="/applicant/applications" className="text-xs text-primary hover:underline font-medium">
                View Tracker
              </Link>
            </CardHeader>
            <CardContent className="pt-4 divide-y">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-xs text-foreground">{app.job.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {app.job.company.name} • {app.job.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={app.status === 'offer' ? 'success' : 'secondary'} className="uppercase text-[10px] font-mono">
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(app.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test History */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Verified Test Results & Credentials
              </CardTitle>
              <Link to="/tests" className="text-xs text-primary hover:underline font-medium">
                Browse All Tests
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {testAttempts.map((att) => (
                <div key={att.id} className="rounded-lg border p-3 flex items-center justify-between text-xs bg-muted/20">
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">{att.test.title}</div>
                    <div className="text-muted-foreground text-[11px]">
                      Grade: <strong className="text-foreground">{att.grade_band}</strong> ({att.score_percentage}%) • Duration: {Math.floor((att.duration_seconds || 1200) / 60)} mins
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="gap-1 text-[10px]">
                      <ShieldCheck className="w-3 h-3" />
                      Proctored Clean
                    </Badge>
                    <Link to="/tests/results">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recommended Openings & Profile Checklist */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-3 space-y-2 hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/jobs/${job.id}`} className="font-semibold text-xs text-foreground hover:underline">
                        {job.title}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{job.company.name}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {job.match_percentage}% Match
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                    <span>{formatCurrency(job.min_salary)}</span>
                    <Link to={`/jobs/${job.id}`} className="text-primary font-medium hover:underline flex items-center">
                      Details <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
