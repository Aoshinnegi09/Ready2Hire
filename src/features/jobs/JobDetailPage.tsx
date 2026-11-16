import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DEMO_JOBS, DEMO_APPLICATIONS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2,
  MapPin,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Share2,
  Bookmark,
  ArrowLeft,
  ShieldCheck,
  Send,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const JobDetailPage: React.FC = () => {
  const { jobId = 'job-01' } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const job = DEMO_JOBS.find((j) => j.id === jobId) || DEMO_JOBS[0];

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [shareTestConsent, setShareTestConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApply = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApplyModalOpen(false);
      setHasApplied(true);
      toast.success(`Application submitted to ${job.company.name} for ${job.title}!`);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <Link
        to="/jobs"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Openings
      </Link>

      {/* Main Job Header */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{job.company.name}</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {job.work_mode}
                </Badge>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {job.job_type}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {job.min_experience}-{job.max_experience} yrs exp
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  {formatCurrency(job.min_salary)} - {formatCurrency(job.max_salary)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  disabled={hasApplied}
                  onClick={() => setIsApplyModalOpen(true)}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Easy Apply
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Applications close {formatDate(job.deadline)}
              </span>
            </div>
          </div>

          {/* Match Score Strip */}
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs">
                <strong className="text-emerald-900 dark:text-emerald-200">
                  {job.match_percentage}% Profile Match
                </strong>{' '}
                — Your verified skills align strongly with this role requirements.
              </div>
            </div>
            <Link to="/resume-analyzer">
              <Button size="sm" variant="outline" className="h-7 text-xs bg-background">
                View 5-Agent Breakdown
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description & Responsibilities */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-foreground">
                About the Position
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>{job.description}</p>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Key Responsibilities:</h4>
                <p>{job.responsibilities || 'Contribute to core feature development, write automated unit tests, and maintain high service uptime.'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Technical Requirements:</h4>
                <p>{job.requirements}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-2">Required Core Competencies:</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Company Snapshot */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-foreground">
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {job.company.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    {job.company.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-muted-foreground text-[11px]">{job.company.industry}</div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed pt-1">
                {job.company.description}
              </p>

              <div className="pt-2 border-t space-y-1.5 text-muted-foreground text-[11px]">
                <div className="flex justify-between">
                  <span>Headquarters</span>
                  <span className="font-medium text-foreground">{job.company.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Organization Size</span>
                  <span className="font-medium text-foreground">{job.company.company_size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Easy Apply Modal with Consent Toggle */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Application</DialogTitle>
            <DialogDescription className="text-xs">
              Applying to <strong>{job.title}</strong> at <strong>{job.company.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Selected Resume */}
            <div className="rounded-lg border p-3 space-y-1 bg-muted/40">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Selected Resume:</span>
                <Badge variant="outline" className="text-[10px]">Primary</Badge>
              </div>
              <p className="text-muted-foreground">Aravind_Kumar_Resume_2026.pdf (ATS Score: 92%)</p>
            </div>

            {/* Assessment Consent Toggle */}
            <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent"
                  checked={shareTestConsent}
                  onChange={(e) => setShareTestConsent(e.target.checked)}
                  className="mt-0.5 rounded text-primary"
                />
                <label htmlFor="consent" className="space-y-0.5 cursor-pointer">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Share Verified Skill Test Credentials
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    Permit {job.company.name} recruiting team to view your verified skill test score (DSA: Grade A+, 93.3%) and clean proctoring verification report.
                  </p>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} isLoading={isSubmitting}>
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
