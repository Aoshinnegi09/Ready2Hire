import React, { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { DEMO_APPLICATIONS, DEMO_JOBS, DEMO_TEST_ATTEMPTS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProctoringReportModal } from '@/features/proctoring/components/ProctoringReportModal';
import { CandidateComparisonModal } from './CandidateComparisonModal';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Plus,
  ShieldAlert,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import type { CandidateApplication, ApplicationStatus } from '@/types';
import { toast } from 'sonner';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState<CandidateApplication[]>(DEMO_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all'); // all, clean, flagged

  // Modals state
  const [selectedAttemptForProctoring, setSelectedAttemptForProctoring] = useState<any | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  // New Job form
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('Bangalore, India');
  const [jobSalary, setJobSalary] = useState('18 LPA');
  const [jobSkills, setJobSkills] = useState('Java, Go, PostgreSQL, Redis');

  // Candidate comparison selection
  const handleToggleSelect = (appId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      }
      if (prev.length >= 3) {
        toast.warning('You can compare a maximum of 3 candidates simultaneously.');
        return prev;
      }
      return [...prev, appId];
    });
  };

  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    toast.success(`Application status updated to "${newStatus.replace(/_/g, ' ')}"`);
  };

  const handleExportCSV = () => {
    const headers = ['Applicant Name', 'Email', 'Job Title', 'Status', 'Match %', 'Resume Score', 'Proctoring Risk'];
    const rows = applications.map((a) => [
      `"${a.applicant.full_name}"`,
      `"${a.applicant.email}"`,
      `"${a.job.title}"`,
      `"${a.status}"`,
      a.match_score,
      a.resume_score,
      a.proctoring_risk || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ready2Hire_Candidate_Pipeline_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Candidate pipeline exported to CSV.');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    toast.success(`Position "${jobTitle}" published to college placement portal!`);
    setIsPostJobOpen(false);
    setJobTitle('');
  };

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.applicant.full_name.toLowerCase().includes(search.toLowerCase()) ||
        app.job.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesRisk =
        filterRisk === 'all' ||
        (filterRisk === 'clean' && (app.proctoring_risk || 0) < 30) ||
        (filterRisk === 'flagged' && (app.proctoring_risk || 0) >= 30);

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [applications, search, filterStatus, filterRisk]);

  const selectedCandidatesForComparison = applications.filter((a) =>
    selectedCandidateIds.includes(a.id)
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recruitment Pipeline & Candidate Review
            </h1>
            <Badge variant="outline" className="border-emerald-600 text-emerald-600 font-mono text-[10px]">
              Razorpay Talent Team
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage incoming university candidates, review 5-agent resume match scores, and audit proctored tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsPostJobOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Post New Role
          </Button>
        </div>
      </div>

      {/* Funnel KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Active Roles</span>
          <div className="text-2xl font-bold text-foreground">4 Openings</div>
          <p className="text-[10px] text-muted-foreground">Payments & Frontend</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Total Applicants</span>
          <div className="text-2xl font-bold text-foreground">{applications.length} Students</div>
          <p className="text-[10px] text-muted-foreground">Campus 2026 Batch</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Tested & Verified</span>
          <div className="text-2xl font-bold text-emerald-600">3 Assessed</div>
          <p className="text-[10px] text-muted-foreground">Proctored Code Scores</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Offers Extended</span>
          <div className="text-2xl font-bold text-primary">1 Offer</div>
          <p className="text-[10px] text-muted-foreground">Fixed CTC 18 LPA</p>
        </Card>
      </div>

      {/* Candidate Pipeline Controls */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates or job titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            >
              <option value="all">All Proctoring</option>
              <option value="clean">Clean Only (&lt;30 Risk)</option>
              <option value="flagged">Flagged Anomaly (&ge;30 Risk)</option>
            </select>
          </div>

          {selectedCandidateIds.length >= 2 && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setIsComparisonOpen(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Compare ({selectedCandidateIds.length}) Selected
            </Button>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="p-3 w-8">
                  <span className="sr-only">Select</span>
                </th>
                <th className="p-3 font-semibold">Candidate</th>
                <th className="p-3 font-semibold">Applied Position</th>
                <th className="p-3 font-semibold">Match %</th>
                <th className="p-3 font-semibold">Resume ATS</th>
                <th className="p-3 font-semibold">Skill Test</th>
                <th className="p-3 font-semibold">Proctoring Risk</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCandidates.map((candidate) => {
                const isSelected = selectedCandidateIds.includes(candidate.id);
                const hasAnomaly = (candidate.proctoring_risk || 0) >= 30;

                return (
                  <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(candidate.id)}
                        className="rounded text-primary"
                      />
                    </td>
                    <td className="p-3 font-medium">
                      <div className="space-y-0.5">
                        <div className="text-foreground font-semibold">{candidate.applicant.full_name}</div>
                        <div className="text-[10px] text-muted-foreground">{candidate.applicant.email}</div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{candidate.job.title}</td>
                    <td className="p-3">
                      <Badge variant="success" className="font-mono text-[10px]">
                        {candidate.match_score}%
                      </Badge>
                    </td>
                    <td className="p-3 font-mono">{candidate.resume_score || 90}%</td>
                    <td className="p-3">
                      {candidate.best_test_attempt ? (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          Grade {candidate.best_test_attempt.grade_band} ({candidate.best_test_attempt.score_percentage}%)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAttemptForProctoring(
                            candidate.best_test_attempt || DEMO_TEST_ATTEMPTS[0]
                          )
                        }
                        className="hover:underline flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <Badge
                          variant={hasAnomaly ? 'destructive' : 'success'}
                          className="text-[10px] cursor-pointer"
                        >
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          {candidate.proctoring_risk || 8.5}/100
                        </Badge>
                      </button>
                    </td>
                    <td className="p-3">
                      <select
                        value={candidate.status}
                        onChange={(e) =>
                          handleUpdateStatus(candidate.id, e.target.value as ApplicationStatus)
                        }
                        className="h-7 rounded border border-input bg-background px-2 py-0.5 text-[11px] font-mono capitalize"
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2 text-primary"
                          onClick={() => handleUpdateStatus(candidate.id, 'shortlisted')}
                        >
                          Shortlist
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Proctoring Report Modal */}
      {selectedAttemptForProctoring && (
        <ProctoringReportModal
          isOpen={Boolean(selectedAttemptForProctoring)}
          onClose={() => setSelectedAttemptForProctoring(null)}
          attempt={selectedAttemptForProctoring}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      <CandidateComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        candidates={selectedCandidatesForComparison}
      />

      {/* Post Role Dialog */}
      <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post Campus Engineering Opening</DialogTitle>
            <DialogDescription className="text-xs">
              Publish a verified role to college seniors and candidate streams.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateJob} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="jTitle">Job Title</Label>
              <Input
                id="jTitle"
                placeholder="Software Development Engineer I (Core Backend)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="jLoc">Location</Label>
                <Input
                  id="jLoc"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jSal">CTC Package</Label>
                <Input
                  id="jSal"
                  value={jobSalary}
                  onChange={(e) => setJobSalary(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jSkills">Required Skills (Comma separated)</Label>
              <Input
                id="jSkills"
                value={jobSkills}
                onChange={(e) => setJobSkills(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPostJobOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Publish Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
