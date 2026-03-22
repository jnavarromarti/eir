import { useState, useEffect } from 'react';

/**
 * Returns a Date that updates every `intervalMs` (default 60 s).
 * Used by DayView / WeekView to position the "now" indicator.
 */
export function useCurrentTime(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
