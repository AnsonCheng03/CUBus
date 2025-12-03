import React from 'react';
import { IonButton, IonPage } from '@ionic/react';
import icon from '../assets/bus.jpg';
import './DownloadFiles.css';
import { useTranslation } from 'react-i18next';

import { useAppState } from '@app/providers/AppState';
import { log } from '@shared/lib/logger';
import { useBackgroundPoll } from '@shared/hooks/useBackgroundPoll';

// NOTE: We keep using your existing bootstrap hook for now.
// It should accept the same args you already use.
import { useAppBootstrap } from '../hooks/useAppBootstrap';

const DownloadFiles: React.FC = () => {
  const { t, i18n } = useTranslation('preset');
  const { setAppData, setNetworkError, setRealtimeData, setDownloadedState } = useAppState();

  const [hint, setHint] = React.useState(t('DownloadFiles-Initializing'));
  const [err, setErr] = React.useState(false);
  const [stale, setStale] = React.useState(true);

  // FAST boot: no blocking network (same behavior as before)
  const { ready, datesRef, repo } = useAppBootstrap(
    {
      i18next: i18n,
      setAppData,
      setNetworkError,
      setRealtimeData,
      setHint,
      t,
    },
    'fast', // or "syncOnIdle"
  );

  React.useEffect(() => {
    if (ready) {
      setDownloadedState(true);
      setHint(t('DownloadFiles-Complete'));
    }
  }, [ready, setDownloadedState, t]);

  // Poll realtime every 10s when app visible/active
  useBackgroundPoll(
    async () => {
      try {
        await repo.current?.realtimeOnce();
      } catch (e) {
        // non-fatal; allow next tick
        log.warn('realtimeOnce failed', e);
      }
    },
    { intervalMs: 10_000, enabled: true },
  );

  // Poll delta sync every 5 min when app visible/active
  useBackgroundPoll(
    async () => {
      try {
        const dates = datesRef.current ?? null;
        await repo.current?.syncDelta(dates);
        setStale(false);
      } catch (e) {
        setErr(true);
        setStale(true);
        log.warn('syncDelta failed', e);
      }
    },
    { intervalMs: 5 * 60_000, enabled: true },
  );

  return (
    <IonPage>
      <div className="downloadFilesContainer">
        <img src={icon} alt="icon" />
        <h1>{hint}</h1>

        {err && (
          <IonButton
            color="medium"
            onClick={async () => {
              try {
                if ('serviceWorker' in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  regs.forEach((r) => r.unregister());
                }
              } finally {
                window.location.reload();
              }
            }}
          >
            {t('reset_app')}
          </IonButton>
        )}
      </div>
    </IonPage>
  );
};

export default DownloadFiles;
