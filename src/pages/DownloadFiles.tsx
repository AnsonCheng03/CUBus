// screens/DownloadFiles.tsx
import React from "react";
import { IonButton, IonPage } from "@ionic/react";
import icon from "../assets/bus.jpg";
import "./DownloadFiles.css";
import { useTranslation } from "react-i18next";
import { useActiveBusPolling } from "../utils/useActiveBusPolling";
import { useAppBootstrap } from "../hooks/useAppBootstrap";

type DownloadFilesProps = {
  setAppData: (data: any) => void;
  setNetworkError: (error: any) => void;
  setRealtimeData: (data: any) => void;
  setDownloadedState: (state: boolean) => void;
};

// help me find the type for DownloadFilesProps
const DownloadFiles: React.FC<DownloadFilesProps> = ({
  setAppData,
  setNetworkError,
  setRealtimeData,
  setDownloadedState,
}) => {
  const { t, i18n } = useTranslation("preset");
  const [hint, setHint] = React.useState(t("DownloadFiles-Initializing"));
  const [err, setErr] = React.useState(false);
  const [stale, setStale] = React.useState(true); // show “not latest” badge

  // FAST boot: no blocking network
  const { ready, datesRef, repo } = useAppBootstrap(
    {
      i18next: i18n,
      setAppData,
      setNetworkError,
      setRealtimeData,
      setHint,
      t,
    },
    "fast" // or "syncOnIdle" 如果想自動做一次空檔同步
  );

  React.useEffect(() => {
    if (ready) {
      setDownloadedState(true);
      setHint(t("DownloadFiles-Complete"));
    }
  }, [ready]);

  // 延後啟動輪詢（避免剛開 app 搶資源）
  useActiveBusPolling({
    getDates: () => datesRef.current ?? null,
    realtimeMs: 10_000,
    lastUpdatedMs: 5 * 60_000,
    onRealtime: async () => {
      try {
        await repo.current?.realtimeOnce();
      } catch {}
    },
    onLastUpdated: async (dates) => {
      try {
        await repo.current?.syncDelta(dates ?? null);
        setStale(false);
      } catch {
        setErr(true);
        setStale(true);
      }
    },
  });

  return (
    <IonPage>
      <div className="downloadFilesContainer">
        <img src={icon} alt="icon" />
        <h1>{hint}</h1>

        {err && (
          <IonButton
            color="medium"
            onClick={async () => {
              if ("serviceWorker" in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                regs.forEach((r) => r.unregister());
              }
              window.location.reload();
            }}
          >
            {t("reset_app")}
          </IonButton>
        )}
      </div>
    </IonPage>
  );
};

export default DownloadFiles;
