import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { signIn, switchDemoRole, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email);
      if (error) {
        toast.error(error.message || 'Invalid credentials. Please verify your login details.');
      } else {
        toast.success('Welcome back to Ready2Hire!');
        if (from !== '/') {
          navigate(from);
        } else if (email.includes('recruiter') || email.includes('razorpay')) {
          navigate('/recruiter');
        } else if (email.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/applicant');
        }
      }
    } catch {
      toast.error('Connection error. Please check your network or credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'applicant' | 'recruiter' | 'admin') => {
    switchDemoRole(role);
    toast.success(`Logged in as demo ${role}`);
    navigate(role === 'applicant' ? '/applicant' : role === 'recruiter' ? '/recruiter' : '/admin');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left: Brand Showcase Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-slate-100 border-r border-slate-800 relative overflow-hidden">
        {/* Subtle geometric background grid */}
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
              Verified Hiring & Assessment Platform
            </Badge>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Elevate college recruitment with high-trust integrity.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Multi-agent resume alignment, automated server-side skill grading, and real-time browser integrity proctoring designed for campus placement excellence.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5-Agent deterministic resume evaluation against job descriptions</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>In-browser proctoring: face pose, iris gaze, and object detection</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-trust server-graded test attempts with tamper protection</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>B.Tech CSE Capstone Project</span>
          <span>Spring 2026</span>
        </div>
      </div>

      {/* Right: Auth Form Panel */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo header */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="text-lg font-bold">Ready2Hire</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your dashboard and active workflows.
            </p>
          </div>

          {/* Quick Demo Role Selector */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Live Demo 1-Click Credentials
              </span>
              <span className="text-[11px] text-muted-foreground">Instant Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium bg-background hover:bg-accent"
                onClick={() => handleQuickDemoLogin('applicant')}
              >
                Student
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium bg-background hover:bg-accent"
                onClick={() => handleQuickDemoLogin('recruiter')}
              >
                Recruiter
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium bg-background hover:bg-accent"
                onClick={() => handleQuickDemoLogin('admin')}
              >
                Admin
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu or name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account yet?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
