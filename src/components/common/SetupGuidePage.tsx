import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Copy, Terminal, Shield, Database, Cloud, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export const SetupGuidePage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isConfigured = isSupabaseConfigured();

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Create a Supabase Project',
      desc: 'Head to the Supabase dashboard and provision a new project named ready2hire (PostgreSQL 15+).',
      actionUrl: 'https://supabase.com/dashboard',
      actionText: 'Open Supabase Dashboard',
      commands: null,
    },
    {
      title: '2. Obtain API Keys & Update .env',
      desc: 'Navigate to Project Settings -> API. Copy your Project URL and anon public key into .env.',
      commands: `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nSUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
    },
    {
      title: '3. Supabase CLI: Login, Link & Push Migrations',
      desc: 'Authenticate via the CLI, link your remote project ref, and apply the migrations.',
      commands: `npx supabase login\nnpx supabase link --project-ref <your-project-id>\nnpx supabase db push`,
    },
    {
      title: '4. Authentication & Dashboard Settings',
      desc: 'In Authentication -> Providers -> Email:\n- Disable "Confirm email" for smooth capstone demoing (prevents email rate-limiting).\n- Set Redirect URLs to: http://localhost:5173/** and your Vercel domain.',
      commands: null,
    },
    {
      title: '5. Storage Buckets (Resumes, Avatars, Proctoring Evidence)',
      desc: 'The SQL migration automatically configures the buckets and RLS policies. Verify in Storage:',
      commands: `# Bucket Configuration\n- avatars: Public (Max 5MB)\n- resumes: Private (Max 10MB)\n- proctoring-evidence: Private (Max 5MB)`,
    },
    {
      title: '6. Deploy Edge Functions & Secrets',
      desc: 'Deploy the 5-agent resume matcher and server-side test grading functions:',
      commands: `npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>\nnpx supabase functions deploy resume-analyzer\nnpx supabase functions deploy grade-test`,
    },
    {
      title: '7. Run Seed Script',
      desc: 'Seed 1 admin, 3 recruiters, 15+ students, 15+ jobs, 40+ applications, tests, and mock proctoring results:',
      commands: `npm run seed`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Supabase Production Setup Checklist
            </h1>
            {isConfigured ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="warning">Setup Pending / Demo Active</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Follow this numbered checklist to connect Ready2Hire to your live Supabase cloud backend.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <Card key={idx} className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-xs whitespace-pre-line text-muted-foreground">
                    {step.desc}
                  </CardDescription>
                </div>
                {step.actionUrl && (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    {step.actionText}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </CardHeader>
            {step.commands && (
              <CardContent>
                <div className="relative rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <pre className="overflow-x-auto whitespace-pre">{step.commands}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-2 h-7 px-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    onClick={() => copyToClipboard(step.commands!, idx)}
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
