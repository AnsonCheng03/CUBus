import { useEffect, useRef } from "react";

export type ModificationDates = Record<string, string> | null;

type Options = {
  getDates: () => ModificationDates;
  realtimeMs?: number;
  lastUpdatedMs?: number;
  onRealtime: () => Promise<void>;
  onLastUpdated: (dates: ModificationDates) => Promise<void>;
};

export function useActiveBusPolling({
  getDates,
  onRealtime,
  onLastUpdated,
  realtimeMs = 10_000,
  lastUpdatedMs = 5 * 60_000,
}: Options) {
  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef<boolean>(true);
  const onlineRef = useRef<boolean>(true);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const start = () => {
    if (!activeRef.current || !onlineRef.current) return;
    if (abortRef.current && !abortRef.current.signal.aborted) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const run = async (
      fn: () => Promise<void>,
      interval: number,
      initialDelay: number
    ) => {
      if (controller.signal.aborted) return;
      if (initialDelay > 0) await sleep(initialDelay);
      while (!controller.signal.aborted) {
        try {
          await fn();
        } catch {
          // swallow; keep polling
        }
        await sleep(interval);
      }
    };

    // fast sync on activation
    onRealtime().catch(() => {});
    onLastUpdated(getDates()).catch(() => {});

    // steady polling while active
    run(onRealtime, realtimeMs, 0);
    run(() => onLastUpdated(getDates()), lastUpdatedMs, 2_000);
  };

  useEffect(() => {
    let removeAppListener: (() => void) | null = null;
    let removeNetListener: (() => void) | null = null;

    // Web visibility fallback works everywhere
    const onVis = () => {
      activeRef.current = !document.hidden;
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);

    // Try loading Capacitor plugins if available (mobile builds)
    const setupCapacitor = async () => {
      let AppMod: any = null;
      let NetworkMod: any = null;

      try {
        AppMod = await import("@capacitor/app");
      } catch {}
      try {
        NetworkMod = await import("@capacitor/network");
      } catch {}

      if (AppMod?.App?.addListener) {
        const sub = AppMod.App.addListener(
          "appStateChange",
          ({ isActive }: { isActive: boolean }) => {
            activeRef.current = isActive;
            if (isActive) start();
            else stop();
          }
        );
        removeAppListener = () => sub.remove();
      }

      if (NetworkMod?.Network?.addListener) {
        try {
          const status = await NetworkMod.Network.getStatus();
          onlineRef.current = !!status.connected;
        } catch {
          onlineRef.current = true;
        }
        const netSub = NetworkMod.Network.addListener(
          "networkStatusChange",
          (s: { connected: boolean }) => {
            onlineRef.current = !!s.connected;
            if (s.connected) start();
            else stop();
          }
        );
        removeNetListener = () => netSub.remove();
      }
    };

    setupCapacitor().finally(() => {
      // start once at mount if active
      start();
    });

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      removeAppListener?.();
      removeNetListener?.();
      stop();
    };
  }, []);
}
