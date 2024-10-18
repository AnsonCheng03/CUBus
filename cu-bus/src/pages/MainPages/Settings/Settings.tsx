import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTextarea,
  IonToggle,
} from "@ionic/react";
import "./Settings.css";
import SchoolBusPermit from "../../AddonPages/schoolBusPermit";
import { useTranslation } from "react-i18next";

import { Storage } from "@ionic/storage";
import { useEffect } from "react";
const store = new Storage();
store.create(); // Initialize the storage

const Settings: React.FC<{
  appSettings: any;
  setAppSettings: any;
}> = ({ appSettings, setAppSettings }) => {
  const [t, i18n] = useTranslation("global");

  useEffect(() => {
    console.log("Saving appSettings to storage:", appSettings);
    store.set("appSettings", appSettings);
  }, [appSettings]);

  function expand(element: HTMLElement) {
    if (
      element.querySelector(".option-expand")?.classList.contains("expanded")
    ) {
      element.querySelector(".option-expand")?.classList.remove("expanded");
    } else {
      element.querySelector(".option-expand")?.classList.toggle("expanded");
    }
  }
  return (
    <IonPage className="pageSafeArea">
      <IonContent className="setting-content">
        <SchoolBusPermit
          appSettings={appSettings}
          setAppSettings={setAppSettings}
        />

        <IonList inset={true}>
          <IonItem
            onClick={async () => {
              await i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
              window.location.reload();
            }}
          >
            <IonLabel>
              {i18n.language === "zh" ? "Change Language" : "轉換語言"}
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonToggle
              checked={appSettings.searchSortDontIncludeWaitTime}
              onIonChange={(e: CustomEvent) => {
                setAppSettings({
                  ...appSettings,
                  searchSortDontIncludeWaitTime: e.detail.checked,
                });
              }}
            >
              <IonLabel>{t("routeNoWaitTimeT")}</IonLabel>
              <IonNote color="medium">{t("routeNoWaitTimeD")}</IonNote>
            </IonToggle>
          </IonItem>
          <IonItem
            onClick={async () => {
              await store.clear();
              window.location.reload();
            }}
          >
            <IonLabel>{t("Delete-Storage")}</IonLabel>
          </IonItem>
        </IonList>
        <IonList inset={true}>
          <IonItem onClick={() => window.open("https://payme.hsbc/anson03")}>
            <IonLabel>{t("Support-btn")}</IonLabel>
          </IonItem>
          <IonItem
            onClick={() => window.open("https://github.com/AnsonCheng03")}
          >
            <IonLabel>{t("About-btn")}</IonLabel>
          </IonItem>
          <IonItem
            onClick={() => window.open("https://www.instagram.com/01.0720/")}
          >
            <IonLabel>{t("Designer-Abt-btn")}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
