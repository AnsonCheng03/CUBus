import { Redirect, Route } from "react-router-dom";
import {
  IonAccordionGroup,
  IonApp,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTabsContext,
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

import NavBar from "./components/navBar";

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

/* Theme variables */
import "./theme/variables.css";

import "./main.css";

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
            <IonRouterOutlet>
              <Route exact path="/tab1" component={Tab1} />
              <Route exact path="/tab2" component={Tab1} />
              <Route exact path="/tab3" component={Tab1} />
              <Route exact path="/tab4" component={Tab1} />
              <Route component={Tab1} />
            </IonRouterOutlet>
            <NavBar />
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
