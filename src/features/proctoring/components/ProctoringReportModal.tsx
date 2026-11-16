import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  Camera,
  CheckCircle2,
  XCircle,
  FileText,
  User,
} from 'lucide-react';
import type { TestAttemptDetail, ProctoringViolationEvent } from '@/types';
import { formatTimeAgo, formatDate } from '@/lib/utils';
import { DEMO_PROCTORING_EVENTS } from '@/lib/mockData';
import { toast } from 'sonner';

interface ProctoringReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: TestAttemptDetail;
  events?: ProctoringViolationEvent[];
  onSaveDecision?: (decision: string, notes: string) => void;
}

export const ProctoringReportModal: React.FC<ProctoringReportModalProps> = ({
  isOpen,
  onClose,
  attempt,
  events = DEMO_PROCTORING_EVENTS,
  onSaveDecision,
}) => {
  const [notes, setNotes] = useState(attempt.reviewer_notes || '');
  const [decision, setDecision] = useState<string>(attempt.reviewer_decision || 'VERIFIED_PASS');
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  const riskScore = attempt.proctoring_risk_score ?? 10;
  const isFlagged = riskScore >= 50;
  const needsReview = riskScore >= 20 && riskScore < 50;

  const handleSave = () => {
    if (onSaveDecision) {
      onSaveDecision(decision, notes);
    }
    toast.success('Proctoring audit decision saved successfully.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Proctoring Audit & Integrity Report
                </DialogTitle>
                <Badge
                  variant={isFlagged ? 'destructive' : needsReview ? 'warning' : 'success'}
                  className="uppercase text-[11px] font-mono"
                >
                  {attempt.proctoring_status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Candidate: <strong className="text-foreground">{attempt.candidate?.full_name || 'Aravind Kumar'}</strong> • Assessment: {attempt.test.title} • Completed: {formatDate(attempt.completed_at)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Risk Gauge & Formula Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-muted/40 p-4 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Integrity Risk Score
              </span>
              <div className="text-4xl font-extrabold text-foreground">
                <span className={isFlagged ? 'text-destructive' : needsReview ? 'text-amber-500' : 'text-emerald-500'}>
                  {riskScore}
                </span>
                <span className="text-lg text-muted-foreground font-normal">/100</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isFlagged ? 'High anomaly density' : needsReview ? 'Minor alerts flagged' : 'Nominal integrity'}
              </p>
            </div>

            <div className="md:col-span-2 rounded-xl border bg-card p-4 space-y-2 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Transparent Risk Scoring Methodology
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Risk is computed in-browser using weighted debounced triggers: Peripheral Object Detections (+30), Tab Blur (+15), Face Absence (+15), Gaze Deviation (+6).
              </p>
              <div className="rounded bg-muted p-2 font-mono text-[10px] text-muted-foreground">
                Risk = min(100, Σ(W_critical * 30 + W_high * 15 + W_med * 6 + W_low * 2))
              </div>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Chronological Violation Event Log ({events.length})
              </h4>
              <span className="text-[11px] text-muted-foreground">Client-side timestamped</span>
            </div>

            <div className="rounded-lg border divide-y overflow-hidden">
              {events.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  No security or posture anomalies recorded during this session.
                </div>
              ) : (
                events.map((evt, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <div>
                        <div className="font-semibold text-foreground">
                          {evt.event_type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {JSON.stringify(evt.details).replace(/[{}"]/g, '')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {evt.severity}
                      </Badge>
                      {evt.snapshot_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setSelectedSnapshot(evt.snapshot_url!)}
                        >
                          <Camera className="w-3.5 h-3.5 mr-1 text-primary" />
                          View Snapshot
                        </Button>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatTimeAgo(evt.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Snapshot Lightbox Preview if selected */}
          {selectedSnapshot && (
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Violation Evidence Snapshot</span>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSnapshot(null)} className="h-6 text-xs">
                  Close
                </Button>
              </div>
              <div className="rounded-md overflow-hidden border max-h-60 bg-black flex items-center justify-center">
                <img src={selectedSnapshot} alt="Violation Evidence" className="max-h-60 object-contain" />
              </div>
            </div>
          )}

          <Separator />

          {/* Human Reviewer Decision Panel */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Recruiter / Auditor Determination
            </h4>
            <p className="text-xs text-muted-foreground">
              Automated proctoring flags are strictly advisory evidence for human verification. Final decisions rest with the recruiter.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                type="button"
                variant={decision === 'VERIFIED_PASS' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setDecision('VERIFIED_PASS')}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Verified Clean
              </Button>
              <Button
                type="button"
                variant={decision === 'CONDITIONAL' ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setDecision('CONDITIONAL')}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Needs Interview Check
              </Button>
              <Button
                type="button"
                variant={decision === 'FLAGGED_FAIL' ? 'destructive' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setDecision('FLAGGED_FAIL')}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject on Integrity
              </Button>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-medium text-foreground">Audit Notes & Observations:</span>
              <Textarea
                rows={3}
                placeholder="Document your verification rationale for the placement record..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                Save Audit Decision
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
