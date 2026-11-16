import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_TRACKS } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Code,
  Clock,
  HelpCircle,
  ShieldCheck,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const TestsListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredTracks = DEMO_TRACKS.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.track_name?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel =
      selectedLevel === 'all' || track.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Standardized Technical Assessments
            </h1>
            <Badge variant="outline" className="border-emerald-600 text-emerald-600 font-mono text-[10px]">
              AI Proctoring Enforced
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete server-graded assessments to earn verified skill badges for your college placement profile.
          </p>
        </div>

        {/* Search & Level Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skill tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`text-xs capitalize px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => (
          <Card key={track.id} className="border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    track.level === 'advanced'
                      ? 'destructive'
                      : track.level === 'intermediate'
                      ? 'default'
                      : 'secondary'
                  }
                  className="uppercase text-[10px] font-mono"
                >
                  {track.level}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{track.duration_minutes} mins</span>
                </div>
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                {track.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                Curated question pool covering core design patterns, runtime optimizations, and problem solving.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="rounded-md bg-muted/50 p-2.5 text-xs space-y-1.5 border">
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Total Questions</span>
                  <span className="font-semibold text-foreground">{track.total_questions} items</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Passing Score</span>
                  <span className="font-semibold text-foreground">{track.passing_score}%</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Proctoring Mode</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Full Integrity
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t">
              <Link to={`/tests/take/${track.id}`} className="w-full">
                <Button className="w-full h-9 text-xs">
                  Launch Assessment
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
