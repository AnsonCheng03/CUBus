// Settings.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonToggle,
} from "@ionic/react";
import "./Settings.css";
import { useTranslation } from "react-i18next";
import { Storage } from "@ionic/storage";
import ModalInput from "../../Components/newPageModal";
import BusMap from "../../AddonPages/routeMap";

type AppSettings = {
  searchSortDontIncludeWaitTime: boolean;
  [key: string]: any;
};

type WebsiteLink = [string[], string];

type Props = {
  appData: { WebsiteLinks?: WebsiteLink[] } & Record<string, any>;
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  setAppTempData: (key: string, value: any) => void;
  networkError: { batch?: boolean; [k: string]: any };
  onReload?: () => Promise<void>; // optional manual reload
};

const Settings: React.FC<Props> = ({
  appSettings,
  setAppSettings,
  appData,
  setAppTempData,
  networkError,
  onReload,
}) => {
  const { t, i18n } = useTranslation("global");

  // create Storage instance once
  const store = useMemo(() => new Storage(), []);
  const [storeReady, setStoreReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      await store.create();
      if (mounted) setStoreReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [store]);

  // debounce save appSettings
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!storeReady) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await store.set("appSettings", JSON.stringify(appSettings));
      } catch (e) {
        // silent
      }
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [appSettings, store, storeReady]);

  const toggleLanguage = useCallback(async () => {
    const next = i18n.language.includes("en") ? "zh" : "en";
    await i18n.changeLanguage(next);
    setAppTempData("realTimeStation", null);
    setAppTempData("searchStation", null);
  }, [i18n, setAppTempData]);

  const handleClear = useCallback(async () => {
    if (!storeReady) return;
    const ok = window.confirm(t("confirm_clear") || "Clear local data?");
    if (!ok) return;
    await store.clear();
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach((r) => r.unregister());
    }
    window.location.reload();
  }, [store, storeReady, t]);

  const handleReload = useCallback(async () => {
    if (!onReload) return;
    try {
      await onReload();
    } catch {
      // let polling handle errors
    }
  }, [onReload]);

  const langIndex = i18n.language.includes("en") ? 0 : 1;

  return (
    <IonPage>
      <IonContent className="setting-content">
        <div className="setting-page">
          <IonList inset>
            <IonItem button onClick={toggleLanguage}>
              <IonLabel>
                {i18n.language.includes("en") ? "轉換語言" : "Change Language"}
              </IonLabel>
            </IonItem>

            <IonItem lines="full">
              <IonToggle
                checked={!!appSettings.searchSortDontIncludeWaitTime}
                onIonChange={(e: CustomEvent) =>
                  setAppSettings((prev) => ({
                    ...prev,
                    searchSortDontIncludeWaitTime: e.detail.checked,
                  }))
                }
              >
                <IonLabel>{t("routeNoWaitTimeT")}</IonLabel>
                <IonNote color="medium">{t("routeNoWaitTimeD")}</IonNote>
              </IonToggle>
            </IonItem>

            {networkError?.batch === true && (
              <IonItem>
                <IonLabel>{t("batch_fetch_err")}</IonLabel>
                <IonButton
                  onClick={() => window.location.reload()}
                  fill="clear"
                >
                  {t("retry_btn")}
                </IonButton>
              </IonItem>
            )}

            <IonItem button onClick={handleClear}>
              <IonLabel>{t("Delete-Storage")}</IonLabel>
            </IonItem>

            {onReload && (
              <IonItem button onClick={handleReload}>
                <IonLabel>{t("Reload-Data")}</IonLabel>
              </IonItem>
            )}
          </IonList>

          <IonList inset>
            {/* If you still want to open BusMap in a modal, keep your ModalInput here */}
            <ModalInput
              title={t("bus_map_page")}
              previousPage={t("info_page")}
              passedPage={<BusMap />}
            />
            {(appData?.WebsiteLinks ?? []).map((row, idx) => {
              const label = row?.[0]?.[langIndex];
              const href = row?.[1];
              if (!label || !href) return null;
              return (
                <IonItem
                  key={`${label}-${idx}`}
                  button
                  onClick={() =>
                    window.open(href, "_blank", "noopener,noreferrer")
                  }
                >
                  <IonLabel>{label}</IonLabel>
                </IonItem>
              );
            })}
          </IonList>

          <IonList inset>
            <IonItem
              button
              onClick={() =>
                window.open("https://github.com/AnsonCheng03", "_blank")
              }
            >
              <IonLabel>{t("About-btn")}</IonLabel>
            </IonItem>
            <IonItem
              button
              onClick={() =>
                window.open("https://www.instagram.com/01.0720/", "_blank")
              }
            >
              <IonLabel>{t("Designer-Abt-btn")}</IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
