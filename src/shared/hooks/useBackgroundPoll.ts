import { useEffect, useRef } from 'react';
import { useAppVisibility } from './useAppVisibility';
import { useCapacitorAppState } from './useCapacitorAppState';

type Options = {
  intervalMs: number;
  runWhenHidden?: boolean; // default false
  enabled?: boolean; // default true
};

export function useBackgroundPoll(fn: () => void | Promise<void>, opts: Options) {
  const { intervalMs, runWhenHidden = false, enabled = true } = opts;
  const vis = useAppVisibility();
  const app = useCapacitorAppState();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const allowed = runWhenHidden || (vis === 'visible' && app === 'active');
    if (!allowed) return;

    let cancelled = false;
    const tick = () => Promise.resolve(fn()).catch(() => {});
    tick(); // immediate
    timer.current = window.setInterval(() => {
      if (!cancelled) tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      if (timer.current != null) window.clearInterval(timer.current);
      timer.current = null;
    };
  }, [enabled, intervalMs, runWhenHidden, vis, app, fn]);
}
