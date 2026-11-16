import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DEMO_JOBS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const JobsPortalPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const location = searchParams.get('loc') || '';
  const selectedMode = searchParams.get('mode') || 'all';
  const selectedType = searchParams.get('type') || 'all';
  const sortBy = searchParams.get('sort') || 'relevance';

  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const handleSearchChange = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const isSaved = !prev[jobId];
      if (isSaved) {
        toast.success('Job bookmarked to your saved jobs.');
      } else {
        toast.info('Removed from saved jobs.');
      }
      return { ...prev, [jobId]: isSaved };
    });
  };

  const filteredJobs = useMemo(() => {
    return DEMO_JOBS.filter((job) => {
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.required_skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
        job.company.name.toLowerCase().includes(query.toLowerCase());

      const matchesLocation =
        !location || job.location.toLowerCase().includes(location.toLowerCase());

      const matchesMode = selectedMode === 'all' || job.work_mode === selectedMode;
      const matchesType = selectedType === 'all' || job.job_type === selectedType;

      return matchesQuery && matchesLocation && matchesMode && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'salary') return (b.max_salary || 0) - (a.max_salary || 0);
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return (b.match_percentage || 0) - (a.match_percentage || 0);
    });
  }, [query, location, selectedMode, selectedType, sortBy]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Top Search Hero */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Explore Engineering & Campus Openings
          </h1>
          <p className="text-xs text-muted-foreground">
            Apply with 1-click using your verified Ready2Hire resume score and proctored assessment credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Job title, skills (e.g. React, Go, Java), or company..."
              value={query}
              onChange={(e) => handleSearchChange('q', e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="City, state, or remote (e.g. Bangalore)..."
              value={location}
              onChange={(e) => handleSearchChange('loc', e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSearchChange('sort', e.target.value)}
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-xs"
            >
              <option value="relevance">Sort by: Match %</option>
              <option value="newest">Sort by: Newest</option>
              <option value="salary">Sort by: Highest CTC</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs shrink-0"
              onClick={() => {
                setSearchParams(new URLSearchParams());
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filter Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Work Mode */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground">Work Mode</span>
                <div className="space-y-1.5">
                  {['all', 'remote', 'hybrid', 'onsite'].map((mode) => (
                    <label key={mode} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      <input
                        type="radio"
                        name="workMode"
                        checked={selectedMode === mode}
                        onChange={() => handleSearchChange('mode', mode)}
                        className="rounded-full text-primary"
                      />
                      <span className="capitalize">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-xs font-semibold text-foreground">Job Type</span>
                <div className="space-y-1.5">
                  {['all', 'full-time', 'internship', 'contract'].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      <input
                        type="radio"
                        name="jobType"
                        checked={selectedType === type}
                        onChange={() => handleSearchChange('type', type)}
                        className="rounded-full text-primary"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredJobs.length} verified campus openings</span>
            <span>All postings verified by college administration</span>
          </div>

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center space-y-3">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold text-foreground">No matching positions found</h3>
                <p className="text-xs text-muted-foreground">Try clearing filters or searching for different keywords.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSaved = Boolean(savedJobs[job.id]);
                return (
                  <Card key={job.id} className="border shadow-sm hover:border-primary/40 transition-all">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary">{job.company.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{job.location}</span>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono py-0">
                              {job.work_mode}
                            </Badge>
                          </div>
                          <Link to={`/jobs/${job.id}`} className="hover:underline">
                            <h2 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                              {job.title}
                            </h2>
                          </Link>
                          <div className="text-xs font-semibold text-foreground">
                            {formatCurrency(job.min_salary)} - {formatCurrency(job.max_salary)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {job.match_percentage && (
                            <div className="flex flex-col items-end">
                              <Badge variant="success" className="gap-1 font-mono text-xs">
                                <Sparkles className="w-3 h-3" />
                                {job.match_percentage}% Match
                              </Badge>
                              <span className="text-[10px] text-muted-foreground mt-0.5">Based on Resume</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => toggleSaveJob(job.id)}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'text-primary fill-primary' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[11px] font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Posted {formatTimeAgo(job.created_at)}
                          </span>
                          <Link to={`/jobs/${job.id}`}>
                            <Button size="sm" className="h-8 text-xs">
                              Apply Now
                              <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
