import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    } catch (err: any) {
      toast.error(err.message || 'Unable to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Login
        </Link>

        {isSubmitted ? (
          <div className="rounded-xl border bg-card p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">
                We sent a secure password reset link to <strong className="text-foreground">{email}</strong>.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Reset your password
              </h1>
              <p className="text-xs text-muted-foreground">
                Enter your account email to receive a password recovery link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send Recovery Link
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
