import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-card text-muted-foreground text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-foreground">Ready2Hire</span>
          <span>— B.Tech CSE Final Year Capstone Project (2026)</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link to="/setup-guide" className="hover:text-foreground transition-colors">
            Setup Checklist
          </Link>
          <Link to="/jobs" className="hover:text-foreground transition-colors">
            Campus Portal
          </Link>
          <Link to="/tests" className="hover:text-foreground transition-colors">
            Skill Tests
          </Link>
          <Link to="/resume-analyzer" className="hover:text-foreground transition-colors">
            Resume Matcher
          </Link>
        </div>
      </div>
    </footer>
  );
};
