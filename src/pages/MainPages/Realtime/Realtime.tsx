import { getPlatforms, IonPage } from "@ionic/react";

import "./Realtime.css";
import "../assets/routeComp.css";

import {
  Loading,
  LoadingImage,
  LoadingSuspenseView,
} from "../../Components/newPageModal";
import RealtimeView from "./RealtimeView";
import { getLocation } from "../../Functions/getLocation";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";

const Realtime: React.FC<{
  appData: any;
  realtimeData: any;
  appTempData: any;
  setAppTempData: any;
  networkError: { realtime: boolean; batch: boolean };
}> = ({ appData, realtimeData, appTempData, setAppTempData, networkError }) => {
  const [t] = useTranslation("global");
  const [userSetRealtimeDest, setUserSetRealtimeDest] = useState<string | null>(
    null
  );

  const setRealtimeStation = (station: string) => {
    setAppTempData("realTimeStation", station);
    setUserSetRealtimeDest(station);
  };

  const getDefualtStation = async () => {
    if (!getPlatforms().includes("hybrid")) {
      return "MTR";
    }
    const currentLocation = await getLocation(t, appData.GPS);
    if (!currentLocation || currentLocation.length === 0) return "MTR";
    return currentLocation[0][0];
  };

  // Run once on initial app load
  useEffect(() => {
    if (appTempData.realTimeStation) {
      setUserSetRealtimeDest(appTempData.realTimeStation);
      return;
    }

    getDefualtStation().then((station) => {
      setRealtimeStation(station);
    });
  }, []);

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
        <LoadingImage />
      )}
    </IonPage>
  );
};

export default Realtime;
