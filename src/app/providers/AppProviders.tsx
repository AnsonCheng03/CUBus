import React from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@app/i18n';
import { AppStateProvider } from './AppState';

// Ionic setup (same desktop UA check as you had)
setupIonicReact({
  platform: {
    desktop: (win) => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        win.navigator.userAgent,
      );
      return !isMobile;
    },
  },
});

const AppProviders: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n as unknown as any}>
      <IonApp>
        <AppStateProvider>
          <IonReactRouter>{children}</IonReactRouter>
        </AppStateProvider>
      </IonApp>
    </I18nextProvider>
  );
};

export default AppProviders;
