import type { ProctoringViolationEvent, ProctoringSeverity, ProctoringStatus } from '@/types';

export interface ProctoringState {
  riskScore: number;
  status: ProctoringStatus;
  warningsCount: number;
  maxWarnings: number;
  isTerminated: boolean;
  events: ProctoringViolationEvent[];
  referencePhotoUrl: string | null;
}

export class ProctoringEngine {
  private events: ProctoringViolationEvent[] = [];
  private warningCount = 0;
  private maxWarnings = 3;
  private riskThresholdFlag = 35;
  private riskThresholdTerminate = 80;
  private listeners: Array<(state: ProctoringState) => void> = [];
  private referencePhotoUrl: string | null = null;

  constructor(maxWarnings = 3) {
    this.maxWarnings = maxWarnings;
  }

  public setReferencePhoto(dataUrl: string) {
    this.referencePhotoUrl = dataUrl;
  }

  public subscribe(listener: (state: ProctoringState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public logEvent(
    eventType: ProctoringViolationEvent['event_type'],
    severity: ProctoringSeverity,
    details: Record<string, any> = {},
    snapshotUrl?: string
  ): ProctoringViolationEvent {
    const event: ProctoringViolationEvent = {
      attempt_id: details.attemptId || 'current',
      event_type: eventType,
      severity,
      timestamp: new Date().toISOString(),
      details,
      snapshot_url: snapshotUrl,
    };

    this.events.push(event);

    // Increment warnings for high and critical violations
    if (severity === 'high' || severity === 'critical') {
      this.warningCount++;
    }

    this.notify();
    return event;
  }

  public computeRiskScore(): number {
    let rawScore = 0;
    for (const evt of this.events) {
      switch (evt.severity) {
        case 'critical':
          rawScore += 30; // Phone detected, different person, second person
          break;
        case 'high':
          rawScore += 15; // Tab switch, multiple faces, screen share canceled
          break;
        case 'medium':
          rawScore += 6;  // Looking away sustained, window blur
          break;
        case 'low':
          rawScore += 2;  // Brief gaze glance, minor audio peak
          break;
      }
    }
    return Math.min(100, Math.round(rawScore));
  }

  public getStatus(): ProctoringStatus {
    const risk = this.computeRiskScore();
    if (risk >= this.riskThresholdFlag) return 'flagged';
    if (risk >= 20 || this.warningCount > 0) return 'needs_review';
    return 'clean';
  }

  public isTerminated(): boolean {
    return (
      this.warningCount >= this.maxWarnings ||
      this.computeRiskScore() >= this.riskThresholdTerminate
    );
  }

  public getState(): ProctoringState {
    return {
      riskScore: this.computeRiskScore(),
      status: this.getStatus(),
      warningsCount: this.warningCount,
      maxWarnings: this.maxWarnings,
      isTerminated: this.isTerminated(),
      events: [...this.events],
      referencePhotoUrl: this.referencePhotoUrl,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public reset() {
    this.events = [];
    this.warningCount = 0;
    this.referencePhotoUrl = null;
    this.notify();
  }
}
