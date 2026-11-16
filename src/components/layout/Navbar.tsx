import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Briefcase,
  Sparkles,
  Award,
  Layers,
  LogOut,
  User,
  Sliders,
  Bell,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-[33px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              Ready<span className="text-emerald-500">2</span>Hire
            </span>
          </Link>

          {/* Navigation Links based on role */}
          {user && (
            <div className="hidden md:flex items-center gap-1 text-xs font-medium">
              {role === 'applicant' && (
                <>
                  <Link
                    to="/applicant"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/applicant')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/jobs"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/jobs')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    to="/resume-analyzer"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/resume-analyzer')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Resume Analyzer
                  </Link>
                  <Link
                    to="/tests"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/tests')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Skill Tests
                  </Link>
                  <Link
                    to="/applicant/applications"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/applicant/applications')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Applications
                  </Link>
                </>
              )}

              {role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/recruiter')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Candidates Pipeline
                  </Link>
                  <Link
                    to="/jobs"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/jobs')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Openings
                  </Link>
                  <Link
                    to="/tests"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/tests')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Assessment Bank
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/admin')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/jobs"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/jobs')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Job Listings
                  </Link>
                  <Link
                    to="/tests"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/tests')
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tests Pool
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/applicant/profile">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{user.full_name?.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="h-8 text-xs">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
