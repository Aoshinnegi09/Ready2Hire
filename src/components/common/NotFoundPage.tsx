import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto border shadow-sm">
          <Compass className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            404 — Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you requested could not be located. It might have been
            moved, or the URL might be misconfigured.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
