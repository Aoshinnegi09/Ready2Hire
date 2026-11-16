import React, { useState } from 'react';
import { DEMO_USERS, DEMO_JOBS, DEMO_APPLICATIONS, DEMO_TEST_ATTEMPTS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users,
  ShieldCheck,
  Building2,
  Briefcase,
  Sliders,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  BarChart3,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { UserProfile, UserRole } from '@/types';
import { toast } from 'sonner';

const GRADE_DISTRIBUTION_DATA = [
  { grade: 'A+', count: 24, fill: '#10b981' },
  { grade: 'A', count: 38, fill: '#059669' },
  { grade: 'B', count: 42, fill: '#3b82f6' },
  { grade: 'C', count: 18, fill: '#f59e0b' },
  { grade: 'D', count: 9, fill: '#ef4444' },
];

const PROCTORING_OUTCOME_DATA = [
  { name: 'Clean (<20 Risk)', value: 82, color: '#10b981' },
  { name: 'Needs Review', value: 12, color: '#f59e0b' },
  { name: 'Flagged Anomaly', value: 6, color: '#ef4444' },
];

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [searchUser, setSearchUser] = useState('');

  // Proctoring Settings State
  const [warningThreshold, setWarningThreshold] = useState([3]);
  const [riskTerminate, setRiskTerminate] = useState([80]);
  const [retakeCooldownHours, setRetakeCooldownHours] = useState([24]);

  const handleToggleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const next = !u.is_suspended;
          toast.success(`User ${u.full_name} is now ${next ? 'suspended' : 'active'}.`);
          return { ...u, is_suspended: next };
        }
        return u;
      })
    );
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          toast.success(`Role updated for ${u.full_name} to ${newRole}.`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleSaveSettings = () => {
    toast.success('System proctoring and cooldown thresholds saved successfully.');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Institutional Administration & Operations
            </h1>
            <Badge variant="outline" className="border-primary text-primary font-mono text-[10px]">
              Placement Cell Master Console
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            System-wide telemetry, recruiter accreditation queue, proctoring parameters, and user access controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="font-mono text-xs">
            System Status: Operational (99.98%)
          </Badge>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Total Enrolled Students</span>
          <div className="text-2xl font-bold text-foreground">480 Students</div>
          <p className="text-[10px] text-muted-foreground">Batch 2026 CSE & IT</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Accredited Recruiters</span>
          <div className="text-2xl font-bold text-foreground">18 Companies</div>
          <p className="text-[10px] text-muted-foreground">Razorpay, CRED, Swiggy...</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Completed Proctored Tests</span>
          <div className="text-2xl font-bold text-emerald-600">342 Attempts</div>
          <p className="text-[10px] text-muted-foreground">Mean Risk Score: 11.4%</p>
        </Card>

        <Card className="border shadow-sm p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Campus Offers Confirmed</span>
          <div className="text-2xl font-bold text-primary">64 Offers</div>
          <p className="text-[10px] text-muted-foreground">Avg CTC: 19.2 LPA</p>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Standardized Assessment Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_DISTRIBUTION_DATA}>
                <XAxis dataKey="grade" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Proctoring Risk Breakdown */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Proctoring Integrity Audit Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PROCTORING_OUTCOME_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PROCTORING_OUTCOME_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs">
              {PROCTORING_OUTCOME_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <strong className="text-foreground">{item.value}%</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Users, Recruiter Queue, and Settings */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="users" className="text-xs">User Management</TabsTrigger>
          <TabsTrigger value="recruiters" className="text-xs">Recruiter Queue</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Proctoring Rules</TabsTrigger>
        </TabsList>

        {/* TAB 1: User Management */}
        <TabsContent value="users">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Registered Users & Permissions</CardTitle>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search user by name, email, or role..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Registered</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{u.full_name}</div>
                          <div className="text-[10px] text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="h-7 rounded border border-input bg-background px-2 py-0.5 text-[11px] font-mono capitalize"
                          >
                            <option value="applicant">Applicant</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={u.is_suspended ? 'destructive' : 'success'}
                            className="text-[10px]"
                          >
                            {u.is_suspended ? 'Suspended' : 'Active'}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">
                          {u.created_at.split('T')[0]}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant={u.is_suspended ? 'outline' : 'destructive'}
                            className="h-7 text-[11px] px-2.5"
                            onClick={() => handleToggleSuspend(u.id)}
                          >
                            {u.is_suspended ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Recruiter Verification Queue */}
        <TabsContent value="recruiters">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold">Company Recruiter Verification Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="rounded-lg border p-4 flex items-center justify-between bg-muted/20">
                <div className="space-y-1">
                  <div className="font-bold text-foreground">Razorpay University Team</div>
                  <div className="text-muted-foreground text-[11px]">Domain: @razorpay.com • Contact: priya.nair@razorpay.com</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Accredited Partner</Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4 flex items-center justify-between bg-muted/20">
                <div className="space-y-1">
                  <div className="font-bold text-foreground">CRED Talent Acquisition</div>
                  <div className="text-muted-foreground text-[11px]">Domain: @cred.club • Contact: arjun.mehta@cred.club</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Accredited Partner</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Proctoring Thresholds */}
        <TabsContent value="settings">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Global Proctoring Integrity Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 max-w-xl text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Maximum Warnings Before Auto-Submit:</span>
                  <span className="font-mono font-bold text-primary">{warningThreshold[0]} warnings</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  If a candidate triggers this number of sustained high-severity alerts, their test is locked and submitted.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={warningThreshold[0]}
                    onChange={(e) => setWarningThreshold([Number(e.target.value)])}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Integrity Termination Risk Threshold:</span>
                  <span className="font-mono font-bold text-primary">{riskTerminate[0]}/100</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Accumulated risk score that immediately halts examination.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={riskTerminate[0]}
                    onChange={(e) => setRiskTerminate([Number(e.target.value)])}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Retake Cooldown Interval:</span>
                  <span className="font-mono font-bold text-primary">{retakeCooldownHours[0]} hours</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Enforces waiting period between consecutive attempts on the same track.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="6"
                    max="72"
                    step="6"
                    value={retakeCooldownHours[0]}
                    onChange={(e) => setRetakeCooldownHours([Number(e.target.value)])}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveSettings} size="sm">
                  Save Integrity Parameters
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
