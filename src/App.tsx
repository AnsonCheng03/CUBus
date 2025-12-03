import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next, useTranslation } from 'react-i18next';
import preset_en from './translations/en_preset.json';
import preset_zh from './translations/zh_preset.json';

import NavBar from './components/navBar';
import PWAPrompt from './components/mobilePWAPrompt';
import Alert from './components/alertBox';

import Realtime from './pages/MainPages/Realtime/Realtime';
import RouteSearch from './pages/MainPages/RouteSearch/RouteSearch';
import SchoolBusPermit from './pages/MainPages/SchoolBusPermit/SchoolBusPermit';
import Settings from './pages/MainPages/Settings/Settings';
import DownloadFiles from './pages/DownloadFiles';

import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';

/* Ionic CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Theme */
import './theme/variables.css';
import './main.css';

import AppCorrupted from './pages/appCorruped';

import { AppStateProvider, useAppState } from '@app/providers/AppState';

setupIonicReact({
  platform: {
    desktop: (win) =>
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        win.navigator.userAgent,
      ),
  },
});

Sentry.init(
  {
    dsn: 'https://05bedc8c2dfb23fa8f8b70e735e5f409@o4510470118178816.ingest.us.sentry.io/4510470120275968',
    integrations: [
      Sentry.browserTracingIntegration(),
      // new SentryReact.BrowserTracing({
      //   // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      //   tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
      // }),
      // new SentryReact.Replay(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions,
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  },
  // Forward the init method from @sentry/react
  SentryReact.init,
);

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh',
    saveMissing: true,
    interpolation: { escapeValue: false },
    resources: {
      en: { global: {}, preset: preset_en },
      zh: { global: {}, preset: preset_zh },
    },
  });

const AppShell: React.FC = () => {
  useTranslation('global'); // ensures i18n instance ready

  // 🔑 Read everything from context (no local state duplicates)
  const {
    isDownloaded,
    appData,
    appSettings,
    setAppSettings,
    appTempData,
    setAppTempData,
    networkError,
    realtimeData,
  } = useAppState();

  const dataToBeChecked = [
    'timetable.json',
    'bus',
    'notice',
    'station',
    'GPS',
    'WebsiteLinks',
  ] as const;

  const checkDownloadData = (
    keys: readonly string[],
    returnMissing = false,
  ): boolean | string[] => {
    const missing: string[] = [];
    for (const k of keys) {
      if (!appData[k]) missing.push(k);
    }
    return returnMissing ? missing : missing.length === 0;
  };

  return (
    <>
      {isDownloaded ? (
        checkDownloadData(dataToBeChecked) ? (
          <IonReactRouter>
            <Alert notice={appData.notice} />
            <IonRouterOutlet>
              <Route exact path="/realtime">
                <Realtime />
              </Route>

              <Route exact path="/route">
                <RouteSearch />
              </Route>

              <Route exact path="/permit">
                <SchoolBusPermit />
              </Route>

              {/* New Settings uses context, no props */}
              <Route exact path="/settings">
                <Settings />
              </Route>

              {/* Fallback */}
              <Route>
                <Realtime />
              </Route>
            </IonRouterOutlet>
            <NavBar />
            <PWAPrompt />
          </IonReactRouter>
        ) : (
          <AppCorrupted missingData={checkDownloadData(dataToBeChecked, true) as string[]} />
        )
      ) : (
        // New DownloadFiles uses context; no props
        <DownloadFiles />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18next}>
      <IonApp>
        <AppStateProvider>
          <AppShell />
        </AppStateProvider>
      </IonApp>
    </I18nextProvider>
  );
};

export default App;
