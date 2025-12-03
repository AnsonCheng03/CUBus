import { getPlatforms, IonPage } from '@ionic/react';
import './Realtime.css';
import '../assets/routeComp.css';

import RealtimeView from './RealtimeView';
import { getLocation } from '../../../functions/getLocation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';

import { useAppState } from '@app/providers/AppState';

const Realtime: React.FC = () => {
  const [t] = useTranslation('global');

  // 🔑 read/write from context instead of props
  const { appData, realtimeData, appTempData, setAppTempData, networkError } = useAppState();

  const [userSetRealtimeDest, setUserSetRealtimeDest] = useState<string | null>(null);

  const setRealtimeStation = useCallback(
    (station: string) => {
      setAppTempData('realTimeStation', station);
      setUserSetRealtimeDest(station);
    },
    [setAppTempData],
  );

  const getDefaultStation = useCallback(async () => {
    // web default
    if (!getPlatforms().includes('hybrid')) return 'MTR';

    try {
      const currentLocation = await getLocation(t, appData.GPS);
      if (!currentLocation || currentLocation.length === 0) return 'MTR';
      return currentLocation[0][0];
    } catch {
      return 'MTR';
    }
  }, [t, appData.GPS]);

  // run once on initial app load
  useEffect(() => {
    if (appTempData.realTimeStation) {
      setUserSetRealtimeDest(appTempData.realTimeStation);
      return;
    }
    getDefaultStation().then((station) => setRealtimeStation(station));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentional: run only on mount

  return (
    <IonPage>
      {userSetRealtimeDest ? (
        <RealtimeView
          appData={appData}
          realtimeData={realtimeData}
          setUserSetRealtimeDest={setRealtimeStation}
          defaultSelectedStation={userSetRealtimeDest}
          networkError={networkError}
        />
      ) : (
        // keep your existing loading image component
        <div className="realtime-loading">
          {/* if you have <LoadingImage/> already, you can use it here */}
          Loading...
        </div>
      )}
    </IonPage>
  );
};

export default Realtime;
