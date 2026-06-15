import { useEffect } from 'react';
import { AppState } from 'react-native';
import type { MutableRefObject } from 'react';
import type { AppBootstrapStatus, ModificationDates } from '../../shared-core/app/types';
import type { createRepository } from '../../shared-core/data/repository';

type RepositoryInstance = ReturnType<typeof createRepository>;

type Args = {
  bootStatus: AppBootstrapStatus;
  repoRef: MutableRefObject<RepositoryInstance | null>;
  datesRef: MutableRefObject<ModificationDates | null>;
};

export function usePollingLifecycle({ bootStatus, repoRef, datesRef }: Args) {
  useEffect(() => {
    if (bootStatus !== 'ready') {
      return;
    }

    let appState = AppState.currentState;
    let realtimeTimer: ReturnType<typeof setInterval> | null = null;
    let syncTimer: ReturnType<typeof setInterval> | null = null;

    const startTimers = () => {
      if (realtimeTimer || syncTimer) {
        return;
      }

      realtimeTimer = setInterval(() => {
        repoRef.current?.realtimeOnce().catch(() => {});
      }, 10_000);

      syncTimer = setInterval(() => {
        repoRef.current
          ?.syncDelta(datesRef.current)
          .then((dates) => {
            datesRef.current = dates ?? datesRef.current;
          })
          .catch(() => {});
      }, 5 * 60_000);
    };

    const stopTimers = () => {
      if (realtimeTimer) clearInterval(realtimeTimer);
      if (syncTimer) clearInterval(syncTimer);
      realtimeTimer = null;
      syncTimer = null;
    };

    startTimers();
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.match(/inactive|background/) && nextState === 'active') {
        startTimers();
        repoRef.current?.realtimeOnce().catch(() => {});
      }

      if (nextState.match(/inactive|background/)) {
        stopTimers();
      }

      appState = nextState;
    });

    return () => {
      stopTimers();
      sub.remove();
    };
  }, [bootStatus, datesRef, repoRef]);
}
