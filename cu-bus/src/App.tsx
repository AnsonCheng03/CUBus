import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  homeOutline,
  searchOutline,
  informationOutline,
  settingsOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { useTranslation, initReactI18next } from "react-i18next";

import Tab1 from "./pages/Tab1";
import DownloadFiles from "./pages/DownloadFiles";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import { useState } from "react";

setupIonicReact();

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "zh",
    saveMissing: true, // send not translated keys to endpoint
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        global: {},
      },
      zh: {
        global: {},
      },
    },
  });

const App: React.FC = () => {
  const [t, i18n] = useTranslation("global");
  const [isDownloaded, setDownloadedState] = useState(false);

  return (
    <I18nextProvider i18n={i18next}>
      <IonApp>
        {isDownloaded ? (
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/tab1" component={Tab1} />
                <Route exact path="/tab2" component={Tab1} />
                <Route exact path="/tab3" component={Tab1} />
                <Route exact path="/tab4" component={Tab1} />
                <Route component={Tab1} />
              </IonRouterOutlet>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>{t("WEB-Title")}</IonTitle>
                </IonToolbar>
              </IonHeader>
              <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" href="/tab1">
                  <IonIcon aria-hidden="true" icon={homeOutline} />
                  <IonLabel>{t("NAV-Home")}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonIcon aria-hidden="true" icon={searchOutline} />
                  <IonLabel>{t("NAV-StationSearch")}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab3" href="/tab3">
                  <IonIcon aria-hidden="true" icon={informationOutline} />
                  <IonLabel>{t("NAV-Info")}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab4" href="/tab4">
                  <IonIcon aria-hidden="true" icon={settingsOutline} />
                  <IonLabel>{t("NAV-Settings")}</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        ) : (
          <DownloadFiles
            setDownloadedState={setDownloadedState}
            i18next={i18next}
          />
        )}
      </IonApp>
    </I18nextProvider>
  );
};

export default App;
