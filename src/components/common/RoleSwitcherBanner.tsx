import React from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { UserCheck, Briefcase, ShieldCheck, Database, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcherBanner: React.FC = () => {
  const { user, role, switchDemoRole, isConfigured } = useAuth();
  const navigate = useNavigate();

  return (
    <aside aria-label="Demo Role Switcher" className="bg-slate-950 text-slate-100 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <Database className="w-3.5 h-3.5" />
          <span>Demo Showcase Bar:</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">Active Session:</span>
        <span className="font-medium text-slate-200">
          {user?.full_name || 'Guest'}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] uppercase font-mono tracking-wider border-slate-700 bg-slate-900 text-slate-300 py-0 h-4"
        >
          {role || 'None'}
        </Badge>
        {isConfigured ? (
          <Badge variant="success" className="text-[10px] py-0 h-4 bg-emerald-900/60 text-emerald-300 border-emerald-700">
            Supabase Cloud Connected
          </Badge>
        ) : (
          <Badge variant="warning" className="text-[10px] py-0 h-4 bg-amber-950/80 text-amber-300 border-amber-800">
            Local Interactive Demo
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 hidden md:inline">Quick Role Switch:</span>
        <Button
          size="sm"
          variant={role === 'applicant' ? 'default' : 'secondary'}
          className="h-6 text-[11px] px-2.5 py-0 rounded font-medium"
          onClick={() => {
            switchDemoRole('applicant');
            navigate('/applicant');
          }}
        >
          <UserCheck className="w-3 h-3 mr-1" />
          Student
        </Button>

        <Button
          size="sm"
          variant={role === 'recruiter' ? 'default' : 'secondary'}
          className="h-6 text-[11px] px-2.5 py-0 rounded font-medium"
          onClick={() => {
            switchDemoRole('recruiter');
            navigate('/recruiter');
          }}
        >
          <Briefcase className="w-3 h-3 mr-1" />
          Recruiter
        </Button>

        <Button
          size="sm"
          variant={role === 'admin' ? 'default' : 'secondary'}
          className="h-6 text-[11px] px-2.5 py-0 rounded font-medium"
          onClick={() => {
            switchDemoRole('admin');
            navigate('/admin');
          }}
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          Admin
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-[11px] px-2 py-0 text-slate-400 hover:text-slate-200"
          onClick={() => navigate('/setup-guide')}
        >
          <KeyRound className="w-3 h-3 mr-1" />
          Setup Guide
        </Button>
      </div>
    </aside>
  );
};
