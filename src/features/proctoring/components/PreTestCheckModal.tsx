import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Mic,
  Monitor,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface PreTestCheckModalProps {
  testTitle: string;
  onChecksPassed: (mediaData: {
    videoStream: MediaStream;
    screenStream: MediaStream;
    referencePhotoUrl: string;
  }) => void;
  onCancel: () => void;
}

export const PreTestCheckModal: React.FC<PreTestCheckModalProps> = ({
  testTitle,
  onChecksPassed,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Permission states
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [screenGranted, setScreenGranted] = useState(false);
  const [fullscreenGranted, setFullscreenGranted] = useState(false);

  // Audio level meter state (0 - 100)
  const [audioLevel, setAudioLevel] = useState(0);

  // Captured reference photo
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);

  // Stream references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userMediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      // Note: Streams are handed over on completion, only stop if cancelled
    };
  }, []);

  // Step 2: Request Camera & Microphone
  const requestCameraAndMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      userMediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setCameraGranted(true);
      setMicGranted(true);

      // Start Audio level meter
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      toast.success('Camera and microphone connected successfully.');
    } catch (err: any) {
      toast.error(
        'Camera or microphone access denied. Please click the lock icon in your browser URL bar and grant permissions.'
      );
    }
  };

  // Capture Reference Selfie
  const captureReferencePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setReferencePhoto(dataUrl);
    toast.success('Reference identity snapshot captured!');
  };

  // Step 3: Request Entire Screen Share
  const requestScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // Prefer whole screen
        } as any,
        audio: false,
      });

      const videoTrack = stream.getVideoTracks()[0];
      const settings: any = videoTrack.getSettings ? videoTrack.getSettings() : {};

      // Integrity verification: Check displaySurface is 'monitor'
      if (settings.displaySurface && settings.displaySurface !== 'monitor') {
        videoTrack.stop();
        toast.error(
          'Security Policy: You must share your "Entire Screen" (monitor), not just a single browser tab or application window.'
        );
        return;
      }

      screenStreamRef.current = stream;
      setScreenGranted(true);
      toast.success('Entire screen sharing verified.');

      videoTrack.onended = () => {
        setScreenGranted(false);
        toast.warning('Screen sharing was disconnected.');
      };
    } catch (err: any) {
      toast.error('Screen sharing was not granted or was cancelled.');
    }
  };

  // Step 4: Request Fullscreen
  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenGranted(true);
      toast.success('Fullscreen mode activated.');
    } catch (err: any) {
      toast.error('Could not enter fullscreen. Please permit fullscreen mode in your browser.');
    }
  };

  const handleFinish = () => {
    if (!userMediaStreamRef.current || !screenStreamRef.current || !referencePhoto) {
      toast.error('Please complete all security pre-checks before launching.');
      return;
    }

    onChecksPassed({
      videoStream: userMediaStreamRef.current,
      screenStream: screenStreamRef.current,
      referencePhotoUrl: referencePhoto,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
        <CardHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">
                  AI Proctoring Environment Verification
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Assessment: <span className="text-emerald-400 font-medium">{testTitle}</span>
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-xs">
              Step {step} of 4
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* STEP 1: Consent & Notice */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Info className="w-4 h-4 text-emerald-400" />
                  Transparency & Privacy Notice
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ready2Hire utilizes privacy-preserving client-side machine learning.
                  Continuous video/audio is <strong>never recorded or uploaded</strong> to external servers.
                  Only low-resolution evidence snapshots are retained when a verifiable violation occurs (e.g., face absence, tab switches, secondary devices).
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In-Browser MediaPipe Face Mesh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COCO-SSD Peripheral Object Detection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Web Audio Noise Threshold Events</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fullscreen & Focus Lock Verification</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onCancel}>
                  Cancel & Exit
                </Button>
                <Button onClick={() => setStep(2)}>
                  I Understand & Agree
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Camera & Microphone & Selfie */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Live Video Preview */}
                <div className="relative rounded-lg bg-slate-900 border border-slate-800 aspect-video overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {!cameraGranted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/90 gap-2">
                      <Camera className="w-8 h-8 text-slate-500" />
                      <span className="text-xs text-slate-400">Camera preview inactive</span>
                      <Button size="sm" onClick={requestCameraAndMic}>
                        Connect Camera & Mic
                      </Button>
                    </div>
                  )}
                  {cameraGranted && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-emerald-400 border border-emerald-900/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Face Tracking Active
                    </div>
                  )}
                </div>

                {/* Identity Reference & Mic Level */}
                <div className="flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        Microphone Input Level
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{audioLevel}%</span>
                    </div>
                    <Progress value={audioLevel} className="h-2 bg-slate-800" indicatorClassName="bg-emerald-500" />
                    <p className="text-[11px] text-slate-400">
                      Speak a short sentence to verify the microphone meter responds.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Baseline Identity Snapshot
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Capture a clear headshot facing the camera. This baseline will be compared during the exam.
                    </p>
                    {referencePhoto ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={referencePhoto}
                          alt="Baseline"
                          className="w-14 h-14 rounded-md object-cover border border-emerald-500"
                        />
                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Photo verified</span>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!cameraGranted}
                        onClick={captureReferencePhoto}
                        className="w-full text-xs"
                      >
                        Capture Baseline Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  disabled={!cameraGranted || !micGranted || !referencePhoto}
                  onClick={() => setStep(3)}
                >
                  Continue to Screen Share
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Entire Screen Share */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  Full Desktop Screen Sharing Check
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In compliance with exam integrity standards, you must share your <strong>Entire Screen</strong>.
                  Selecting a single browser window or tab will be automatically rejected.
                </p>

                {screenGranted ? (
                  <div className="rounded-md bg-emerald-950/60 border border-emerald-800 p-3 flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Entire desktop display is actively shared and verified.</span>
                  </div>
                ) : (
                  <Button
                    onClick={requestScreenShare}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Share Entire Screen
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button disabled={!screenGranted} onClick={() => setStep(4)}>
                  Continue to Fullscreen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Fullscreen Lock & Launch */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Final Security Check: Fullscreen Lock</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    During the test, exiting fullscreen, switching tabs, or opening developer tools will record security violation events.
                  </p>
                </div>

                {fullscreenGranted ? (
                  <div className="rounded-md bg-emerald-950/60 border border-emerald-800 p-3 flex items-center justify-center gap-2 text-xs text-emerald-300 max-w-sm mx-auto">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Fullscreen locked and ready.</span>
                  </div>
                ) : (
                  <Button onClick={requestFullscreen} className="bg-primary hover:bg-primary/90">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Lock Fullscreen & Validate
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  disabled={!cameraGranted || !screenGranted || !fullscreenGranted || !referencePhoto}
                  onClick={handleFinish}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Begin Proctored Assessment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
