import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_APPLICATIONS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { ApplicationStatus } from '@/types';

const STATUS_STEPS: ApplicationStatus[] = [
  'applied',
  'under_review',
  'shortlisted',
  'test_assigned',
  'interview',
  'offer',
];

export const ApplicationTrackerPage: React.FC = () => {
  const [applications] = useState(DEMO_APPLICATIONS);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'offer':
        return 'success';
      case 'shortlisted':
      case 'interview':
        return 'default';
      case 'under_review':
      case 'test_assigned':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Application Pipeline Tracker
          </h1>
          <p className="text-xs text-muted-foreground">
            Track your candidacies, assessment scores, and recruiter interview milestones in real time.
          </p>
        </div>
        <Link to="/jobs">
          <Button size="sm">
            Browse More Jobs
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {applications.map((app) => {
          const currentStepIndex = STATUS_STEPS.indexOf(app.status);
          const isRejected = app.status === 'rejected';

          return (
            <Card key={app.id} className="border shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{app.job.company.name}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{app.job.location}</span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      {app.job.title}
                    </h2>
                    <div className="text-xs text-muted-foreground font-mono">
                      Applied on {formatDate(app.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getStatusColor(app.status)} className="uppercase text-xs font-mono">
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                    {app.match_score && (
                      <Badge variant="outline" className="text-xs font-mono">
                        Match: {app.match_score}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Timeline Progress Bar */}
                {!isRejected ? (
                  <div className="pt-2">
                    <div className="relative flex items-center justify-between">
                      {/* Connection Line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-muted -z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                        style={{
                          width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />

                      {/* Step Dots */}
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5 z-10 bg-background px-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-muted border-border text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] capitalize whitespace-nowrap hidden sm:inline ${
                                isCurrent
                                  ? 'font-bold text-foreground'
                                  : isCompleted
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {step.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Application not selected for further progression.</span>
                  </div>
                )}

                {/* Recruiter Notes or Action Strip */}
                {app.notes && (
                  <div className="rounded-md bg-muted/40 border p-3 text-xs space-y-1">
                    <span className="font-semibold text-foreground">Recruiter Feedback / Next Action:</span>
                    <p className="text-muted-foreground">{app.notes}</p>
                  </div>
                )}

                {/* Associated Credentials */}
                {app.best_test_attempt && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-foreground">
                        Verified Proctoring Credential Shared: Grade {app.best_test_attempt.grade_band} ({app.best_test_attempt.score_percentage}%)
                      </span>
                    </div>
                    <Link to="/tests/results" className="text-primary hover:underline font-medium">
                      View Credential Report
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
