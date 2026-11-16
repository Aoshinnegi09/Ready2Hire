import { describe, it, expect, beforeEach } from 'vitest';
import { ProctoringEngine } from '../proctoringEngine';

describe('Proctoring Engine & Risk Calculation Suite', () => {
  let engine: ProctoringEngine;

  beforeEach(() => {
    engine = new ProctoringEngine(3);
  });

  it('initializes in clean state with 0 risk and 0 warnings', () => {
    const state = engine.getState();
    expect(state.riskScore).toBe(0);
    expect(state.status).toBe('clean');
    expect(state.warningsCount).toBe(0);
    expect(state.isTerminated).toBe(false);
  });

  it('increments risk score correctly for various event severities', () => {
    // Low event (+2)
    engine.logEvent('RIGHT_CLICK', 'low', { reason: 'contextmenu prevented' });
    expect(engine.computeRiskScore()).toBe(2);

    // Medium event (+6)
    engine.logEvent('LOOKING_AWAY', 'medium', { durationSec: 4.2 });
    expect(engine.computeRiskScore()).toBe(8);

    // High event (+15)
    engine.logEvent('TAB_SWITCH', 'high', { blurSec: 2.1 });
    expect(engine.computeRiskScore()).toBe(23);

    // Critical event (+30)
    engine.logEvent('OBJECT_DETECTED', 'critical', { object: 'cell phone' });
    expect(engine.computeRiskScore()).toBe(53);
  });

  it('escalates warnings count on high and critical violations', () => {
    engine.logEvent('TAB_SWITCH', 'high');
    expect(engine.getState().warningsCount).toBe(1);

    engine.logEvent('OBJECT_DETECTED', 'critical');
    expect(engine.getState().warningsCount).toBe(2);

    engine.logEvent('FULLSCREEN_EXIT', 'high');
    expect(engine.getState().warningsCount).toBe(3);

    // After 3 warnings, exam must terminate
    expect(engine.isTerminated()).toBe(true);
  });

  it('caps risk score at 100', () => {
    for (let i = 0; i < 10; i++) {
      engine.logEvent('OBJECT_DETECTED', 'critical');
    }
    expect(engine.computeRiskScore()).toBe(100);
  });

  it('resets cleanly when instructed', () => {
    engine.logEvent('TAB_SWITCH', 'high');
    engine.reset();
    expect(engine.getState().riskScore).toBe(0);
    expect(engine.getState().warningsCount).toBe(0);
  });
});
