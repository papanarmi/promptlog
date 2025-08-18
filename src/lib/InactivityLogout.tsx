import React from 'react';
import { supabase } from '@/lib/supabaseClient';

const ACTIVITY_STORAGE_KEY = 'pl-last-activity-at';

function getIdleTimeoutMs(): number {
  const minutesRaw = (import.meta as any)?.env?.VITE_IDLE_TIMEOUT_MINUTES;
  const minutes = Number(minutesRaw);
  if (Number.isFinite(minutes) && minutes > 0) return minutes * 60_000;
  return 30 * 60_000; // default: 30 minutes
}

export function InactivityLogout(): React.ReactElement | null {
  const timeoutMsRef = React.useRef<number>(getIdleTimeoutMs());
  const timerIdRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExistingTimer = React.useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const scheduleTimer = React.useCallback(() => {
    clearExistingTimer();
    timerIdRef.current = setTimeout(async () => {
      try {
        alert('You have been logged out due to inactivity.');
      } catch {}
      try {
        await supabase.auth.signOut();
      } finally {
        // Force navigation to login; other tabs will sync via storage events
        window.location.replace('/login');
      }
    }, timeoutMsRef.current);
  }, [clearExistingTimer]);

  const recordActivity = React.useCallback(() => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(Date.now()));
    } catch {}
    scheduleTimer();
  }, [scheduleTimer]);

  React.useEffect(() => {
    // Initialize last activity and start the timer
    recordActivity();

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
      'wheel',
      'pointerdown',
      'pointermove',
    ];

    const onActivity = () => {
      if (document.visibilityState === 'hidden') return;
      recordActivity();
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));
    // visibilitychange is a document event
    const onVisibility = () => { if (document.visibilityState !== 'hidden') recordActivity() }
    document.addEventListener('visibilitychange', onVisibility)

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY) {
        scheduleTimer();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearExistingTimer();
      activityEvents.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage);
    };
  }, [recordActivity, scheduleTimer, clearExistingTimer]);

  return null;
}


