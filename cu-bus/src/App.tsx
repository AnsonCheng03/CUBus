import { Route, RouteComponentProps } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { useTranslation, initReactI18next } from "react-i18next";
import preset_en from "./translations/en_preset.json";
import preset_zh from "./translations/zh_preset.json";

import NavBar from "./components/navBar";

import Realtime from "./pages/Realtime";
import RouteSearch from "./pages/RouteSearch";
import Info from "./pages/Info";
import Settings from "./pages/Settings";
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
        preset: preset_en,
      },
      zh: {
        global: {},
        preset: preset_zh,
      },
    },
  });

const App: React.FC<RouteComponentProps> = () => {
  const [t, i18n] = useTranslation("global");
  const [isDownloaded, setDownloadedState] = useState(false);
  const [appData, setAppData] = useState<any>({});

  return (
    <I18nextProvider i18n={i18next}>
      <IonApp>
        {isDownloaded ? (
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/realtime" component={Realtime} />
              <Route exact path="/route" component={RouteSearch} />
              <Route exact path="/info" component={Info}>
                <Info appData={appData} />
              </Route>
              <Route exact path="/settings" component={Settings} />
              <Route component={Realtime} />
            </IonRouterOutlet>
            <NavBar />
          </IonReactRouter>
        ) : (
          <DownloadFiles
            setDownloadedState={setDownloadedState}
            i18next={i18next}
            setAppData={setAppData}
            appData={appData}
          />
        )}
      </IonApp>
    </I18nextProvider>
  );
};

export default App;
