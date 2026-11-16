import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const { role } = useAuth();

  const homePath =
    role === 'recruiter'
      ? '/recruiter'
      : role === 'admin'
      ? '/admin'
      : '/applicant';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            403 — Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You do not have the required permissions to view this resource.
            This perimeter is protected by Supabase Row-Level Security (RLS) and
            Ready2Hire role guards.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link to={homePath}>
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
