import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, ArrowRight, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'applicant' | 'recruiter'>('applicant');
  const [isLoading, setIsLoading] = useState(false);

  // Compute password strength score (0-4)
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('All fields are required.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const { error, unconfirmed } = await signUp(email, password, fullName, role);
      if (error) {
        toast.error(error.message || 'Signup failed. Please try a different email address.');
      } else if (unconfirmed) {
        toast.info('Verification link sent. Please check your inbox or use demo login.');
        navigate('/login');
      } else {
        toast.success(`Account created successfully as ${role === 'applicant' ? 'Student' : 'Recruiter'}!`);
        navigate(role === 'applicant' ? '/applicant' : '/recruiter');
      }
    } catch {
      toast.error('Unexpected error during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Brand Side Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-slate-100 border-r border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Ready<span className="text-emerald-400">2</span>Hire
            </span>
          </Link>
          <div className="mt-2">
            <Badge variant="outline" className="border-slate-800 bg-slate-900 text-slate-400 text-xs">
              Start Your Verified Journey
            </Badge>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Join the standardized campus hiring network.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Whether you are a student showcasing proctored skills or a talent leader sourcing verified engineering candidates, Ready2Hire brings transparency to every hiring decision.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-1">
              <div className="text-xs font-semibold text-white">For Students</div>
              <p className="text-[11px] text-slate-400">Build ATS-optimized resumes and earn tamper-evident proctoring badges.</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3.5 space-y-1">
              <div className="text-xs font-semibold text-white">For Recruiters</div>
              <p className="text-[11px] text-slate-400">Filter applicants by actual code score, resume match %, and proctoring risk.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Ready2Hire Engine v2.4 — Production Capstone Architecture
        </div>
      </div>

      {/* Signup Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Select your role and begin using the platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection (Student or Recruiter ONLY; Admin is never selectable) */}
            <div className="space-y-1.5">
              <Label>I want to register as:</Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    role === 'applicant'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                  onClick={() => setRole('applicant')}
                >
                  <UserCheck className="w-5 h-5" />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-foreground">Applicant / Student</div>
                    <div className="text-[10px] text-muted-foreground">Take tests & apply</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    role === 'recruiter'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                  onClick={() => setRole('recruiter')}
                >
                  <Briefcase className="w-5 h-5" />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-foreground">Recruiter / Employer</div>
                    <div className="text-[10px] text-muted-foreground">Post jobs & hire</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Aravind Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-colors ${
                          step <= strength
                            ? strength <= 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>
                      {strength <= 1
                        ? 'Weak password'
                        : strength <= 3
                        ? 'Moderate password'
                        : 'Strong password'}
                    </span>
                    <span>{password.length}/8+ chars</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium"
              isLoading={isLoading}
            >
              Complete Registration
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-1">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
