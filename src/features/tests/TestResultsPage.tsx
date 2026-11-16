import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Download,
  Share2,
  RotateCcw,
  BookOpen,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const TestResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('r2h_latest_attempt');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAttempt(parsed);
        // Trigger celebratory confetti if passed!
        if (parsed.scorePercentage >= 65) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Shareable test verification link copied to clipboard!');
  };

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-xl font-bold">No Recent Test Attempt Found</h2>
        <p className="text-sm text-muted-foreground">Select an assessment to begin.</p>
        <Link to="/tests">
          <Button>Browse Assessments</Button>
        </Link>
      </div>
    );
  }

  const isPassed = attempt.scorePercentage >= 65;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Verified Assessment Result
            </Badge>
            <Badge variant={isPassed ? 'success' : 'destructive'}>
              {isPassed ? 'Passed' : 'Needs Retake'}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {attempt.testTitle}
          </h1>
          <p className="text-xs text-muted-foreground">
            Session Completed: {new Date(attempt.completedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share Credential
          </Button>
          <Button size="sm" onClick={handleExportPDF}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score & Grade Band */}
        <Card className="border shadow-sm text-center">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Score & Grade Attained
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-5xl font-black text-foreground">
              {attempt.scorePercentage}
              <span className="text-xl text-muted-foreground font-normal">%</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
              <Award className="w-4 h-4" />
              <span>Grade Band: {attempt.gradeBand}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {attempt.correctCount} of {attempt.totalCount} questions answered accurately
            </p>
          </CardContent>
        </Card>

        {/* Proctoring Verification */}
        <Card className="border shadow-sm text-center">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Integrity & Proctoring
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-5xl font-black text-foreground">
              <span className={attempt.proctoringRiskScore < 25 ? 'text-emerald-500' : 'text-amber-500'}>
                {attempt.proctoringRiskScore}
              </span>
              <span className="text-xl text-muted-foreground font-normal">/100</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Status: {attempt.proctoringStatus.toUpperCase()}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {attempt.warningsCount === 0 ? 'Zero warnings recorded' : `${attempt.warningsCount} warnings flagged`}
            </p>
          </CardContent>
        </Card>

        {/* Duration & Speed */}
        <Card className="border shadow-sm text-center">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Time Taken
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-5xl font-black text-foreground font-mono">
              {Math.floor(attempt.durationSeconds / 60)}
              <span className="text-xl text-muted-foreground font-normal">m</span>
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Completed in {Math.floor(attempt.durationSeconds / 60)} mins {attempt.durationSeconds % 60} secs
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
              Well within allotted exam limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topic Mastery Breakdown */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Topic-Level Skill Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Algorithmic Thinking & Complexity</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Data Structures & Edge Cases</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>System Concurrency & Memory Management</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link to="/tests">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Back to Tests Catalog
          </Button>
        </Link>
        <Link to="/applicant">
          <Button>
            View Applications
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
