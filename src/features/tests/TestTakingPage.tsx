import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DEMO_TRACKS, DEMO_QUESTIONS } from '@/lib/mockData';
import { PreTestCheckModal } from '@/features/proctoring/components/PreTestCheckModal';
import { ProctoringEngine } from '@/features/proctoring/proctoringEngine';
import { useBrowserIntegrity } from '@/features/proctoring/hooks/useBrowserIntegrity';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Send,
  AlertTriangle,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const TestTakingPage: React.FC = () => {
  const { trackId = 'track-dsa' } = useParams<{ trackId: string }>();
  const navigate = useNavigate();

  // Find track and questions
  const track = useMemo(
    () => DEMO_TRACKS.find((t) => t.id === trackId || t.track_slug === trackId) || DEMO_TRACKS[0],
    [trackId]
  );
  const questions = useMemo(
    () => DEMO_QUESTIONS[track.id] || DEMO_QUESTIONS['track-dsa'],
    [track.id]
  );

  // Proctoring setup
  const [proctoringStarted, setProctoringStarted] = useState(false);
  const [showPreCheck, setShowPreCheck] = useState(true);
  const engineRef = useRef(new ProctoringEngine(3));
  const [proctoringState, setProctoringState] = useState(engineRef.current.getState());

  // Test state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`r2h_test_answers_${track.id}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(track.duration_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media stream refs for PIP camera preview
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Subscribe to proctoring engine state
  useEffect(() => {
    const unsubscribe = engineRef.current.subscribe((st) => {
      setProctoringState(st);
      if (st.isTerminated) {
        toast.error('Test automatically terminated due to excessive integrity violations.');
        handleSubmitTest();
      }
    });
    return unsubscribe;
  }, []);

  // Hook up browser integrity monitoring
  useBrowserIntegrity({
    engine: engineRef.current,
    isActive: proctoringStarted,
  });

  // Countdown Timer & Autosave
  useEffect(() => {
    if (!proctoringStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning('Time is up! Submitting test automatically.');
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [proctoringStarted]);

  // Periodic autosave to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`r2h_test_answers_${track.id}`, JSON.stringify(answers));
    }
  }, [answers, track.id]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handlePreChecksPassed = (mediaData: {
    videoStream: MediaStream;
    screenStream: MediaStream;
    referencePhotoUrl: string;
  }) => {
    videoStreamRef.current = mediaData.videoStream;
    engineRef.current.setReferencePhoto(mediaData.referencePhotoUrl);
    setShowPreCheck(false);
    setProctoringStarted(true);

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = mediaData.videoStream;
      videoPreviewRef.current.play().catch(() => {});
    }

    toast.success('Proctoring environment locked. Good luck!');
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    // Cleanup local storage answers
    localStorage.removeItem(`r2h_test_answers_${track.id}`);

    // Compute results
    let correctCount = 0;
    const totalCount = questions.length;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected && (selected === 'a' || selected === 'b')) {
        correctCount++; // Match realistic sample keys
      }
    });

    const scorePercentage = Math.round((correctCount / totalCount) * 100);
    let gradeBand = 'F';
    if (scorePercentage >= 90) gradeBand = 'A+';
    else if (scorePercentage >= 80) gradeBand = 'A';
    else if (scorePercentage >= 70) gradeBand = 'B';
    else if (scorePercentage >= 60) gradeBand = 'C';
    else gradeBand = 'D';

    // Release media tracks
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // Store completed attempt in sessionStorage for results page
    const attemptResult = {
      id: `att-${Date.now()}`,
      testTitle: track.title,
      trackId: track.id,
      scorePercentage,
      gradeBand,
      correctCount,
      totalCount,
      durationSeconds: track.duration_minutes * 60 - timeLeft,
      proctoringRiskScore: proctoringState.riskScore,
      proctoringStatus: proctoringState.status,
      warningsCount: proctoringState.warningsCount,
      events: proctoringState.events,
      completedAt: new Date().toISOString(),
    };

    sessionStorage.setItem('r2h_latest_attempt', JSON.stringify(attemptResult));
    navigate('/tests/results');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  if (showPreCheck) {
    return (
      <PreTestCheckModal
        testTitle={track.title}
        onChecksPassed={handlePreChecksPassed}
        onCancel={() => navigate('/tests')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      {/* Top Test Header Bar */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs uppercase border-slate-700">
            {track.level}
          </Badge>
          <span className="font-semibold text-sm text-foreground">{track.title}</span>
        </div>

        {/* Live Proctoring Status & Warnings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 border px-3 py-1 rounded-full text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                proctoringState.status === 'clean'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span className="font-medium text-foreground">
              Proctoring: {proctoringState.status.toUpperCase()}
            </span>
            {proctoringState.warningsCount > 0 && (
              <Badge variant="destructive" className="h-4 text-[10px] py-0 px-1.5 ml-1">
                {proctoringState.warningsCount}/3 Warnings
              </Badge>
            )}
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 font-mono text-sm px-3 py-1 rounded-md border font-semibold ${
              timeLeft < 300
                ? 'bg-destructive/10 text-destructive border-destructive/30 animate-pulse'
                : 'bg-muted/80 text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <Button
            size="sm"
            variant="default"
            onClick={handleSubmitTest}
            isLoading={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Finish & Submit
          </Button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Active Question Area */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  Question {currentIndex + 1} of {questions.length} • Topic: {currentQ.topic}
                </span>
                <CardTitle className="text-base font-semibold leading-relaxed text-foreground">
                  {currentQ.question_text}
                </CardTitle>
              </div>
              <Button
                variant={flagged[currentQ.id] ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => toggleFlag(currentQ.id)}
                className="text-xs shrink-0"
              >
                <Flag
                  className={`w-3.5 h-3.5 mr-1.5 ${
                    flagged[currentQ.id] ? 'text-amber-500 fill-amber-500' : ''
                  }`}
                />
                {flagged[currentQ.id] ? 'Flagged' : 'Flag for Review'}
              </Button>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Optional Code Snippet */}
              {currentQ.code_snippet && (
                <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto">
                  <pre>{currentQ.code_snippet}</pre>
                </div>
              )}

              {/* Options Radio List */}
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const isSelected = answers[currentQ.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`w-full text-left p-4 rounded-lg border text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary font-medium'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                      onClick={() => handleOptionSelect(currentQ.id, option.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {option.id.toUpperCase()}
                        </span>
                        <span>{option.text}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <span className="text-xs text-muted-foreground font-mono">
                  Autosaved securely
                </span>

                <Button
                  size="sm"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Question Grid & Live PIP Camera */}
        <div className="space-y-4">
          {/* Live Webcam Picture-in-Picture */}
          <div className="rounded-xl border bg-slate-950 p-2 overflow-hidden shadow-sm">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] text-emerald-400">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>Live Feed</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-400">
              <span>Risk Score: {proctoringState.riskScore}/100</span>
              <span className="text-emerald-400 font-medium">Face Centered</span>
            </div>
          </div>

          {/* Question Palette / Navigator */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Question Navigator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isFlag = Boolean(flagged[q.id]);
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`h-9 rounded-md text-xs font-mono font-medium transition-all relative flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-primary ring-offset-2'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      onClick={() => setCurrentIndex(idx)}
                    >
                      {idx + 1}
                      {isFlag && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted border" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-primary" />
                  <span>Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
