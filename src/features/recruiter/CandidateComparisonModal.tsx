import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Award, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import type { CandidateApplication } from '@/types';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateApplication[];
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidates,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Side-by-Side Candidate Comparison
          </DialogTitle>
          <DialogDescription className="text-xs">
            Comparing {candidates.length} shortlisted candidates across resume alignment, skill test grades, and integrity risk scores.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-3 font-semibold text-muted-foreground w-1/4">Metric</th>
                {candidates.map((c) => (
                  <th key={c.id} className="p-3 font-bold text-foreground w-1/3">
                    <div className="space-y-0.5">
                      <div className="text-sm">{c.applicant.full_name}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        Applied for {c.job.title}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3 font-medium text-muted-foreground">Match Score</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 font-bold text-emerald-600 font-mono text-sm">
                    {c.match_score}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-muted-foreground">Resume ATS Score</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 font-mono font-semibold">
                    {c.resume_score || 90}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-muted-foreground">Verified Test Grade</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 font-semibold">
                    {c.best_test_attempt ? (
                      <Badge variant="outline" className="font-mono">
                        Grade {c.best_test_attempt.grade_band} ({c.best_test_attempt.score_percentage}%)
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Pending Assessment</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-muted-foreground">Proctoring Risk</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3">
                    <Badge
                      variant={
                        (c.proctoring_risk || 0) < 20
                          ? 'success'
                          : (c.proctoring_risk || 0) < 50
                          ? 'warning'
                          : 'destructive'
                      }
                      className="font-mono text-[10px]"
                    >
                      {c.proctoring_risk || 8.5}/100 Risk
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-muted-foreground">Application Status</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3">
                    <Badge variant="secondary" className="uppercase text-[10px] font-mono">
                      {c.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-muted-foreground">Recruiter Feedback</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 text-muted-foreground leading-relaxed text-[11px]">
                    {c.notes || 'Under review'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} size="sm">
            Close Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
