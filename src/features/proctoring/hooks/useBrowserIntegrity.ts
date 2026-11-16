import { useEffect, useCallback } from 'react';
import type { ProctoringEngine } from '../proctoringEngine';
import { toast } from 'sonner';

interface UseBrowserIntegrityProps {
  engine: ProctoringEngine;
  isActive: boolean;
  onViolation?: (type: string, severity: 'low' | 'medium' | 'high' | 'critical') => void;
}

export function useBrowserIntegrity({
  engine,
  isActive,
  onViolation,
}: UseBrowserIntegrityProps) {
  const triggerViolation = useCallback(
    (
      type: any,
      severity: 'low' | 'medium' | 'high' | 'critical',
      details: Record<string, any> = {}
    ) => {
      if (!isActive) return;
      engine.logEvent(type, severity, details);
      if (onViolation) onViolation(type, severity);

      if (severity === 'high' || severity === 'critical') {
        toast.error(`Proctoring Warning: Security violation detected (${type.replace(/_/g, ' ')})`, {
          duration: 4000,
        });
      } else {
        toast.warning(`Notice: ${type.replace(/_/g, ' ')} detected`, { duration: 3000 });
      }
    },
    [engine, isActive, onViolation]
  );

  useEffect(() => {
    if (!isActive) return;

    // 1. Tab switch / Visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('TAB_SWITCH', 'high', {
          reason: 'Document hidden / tab switched away',
          timestamp: new Date().toISOString(),
        });
      }
    };

    // 2. Window blur (focus lost)
    const handleWindowBlur = () => {
      triggerViolation('WINDOW_BLUR', 'medium', {
        reason: 'Window focus lost to another application',
      });
    };

    // 3. Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation('FULLSCREEN_EXIT', 'high', {
          reason: 'Exited fullscreen examination mode',
        });
      }
    };

    // 4. Keyboard shortcuts: DevTools & Source inspect
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerViolation('DEVTOOLS_SHORTCUT', 'critical', { key: 'F12' });
        return;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('DEVTOOLS_SHORTCUT', 'critical', { key: `Ctrl+Shift+${e.key.toUpperCase()}` });
        return;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        triggerViolation('DEVTOOLS_SHORTCUT', 'high', { key: 'Ctrl+U' });
        return;
      }
      // Block Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['c', 'v', 'x', 'C', 'V', 'X'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('CLIPBOARD_ACTION', 'medium', { key: `Ctrl+${e.key.toUpperCase()}` });
        return;
      }
    };

    // 5. Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation('RIGHT_CLICK', 'low', { x: e.clientX, y: e.clientY });
    };

    // 6. Copy / Cut / Paste events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('CLIPBOARD_ACTION', 'medium', { action: 'copy' });
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('CLIPBOARD_ACTION', 'medium', { action: 'paste' });
    };

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
    };
  }, [isActive, triggerViolation]);
}
