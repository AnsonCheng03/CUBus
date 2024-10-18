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
  appTempData: any;
  setAppTempData: any;
}> = ({ appData, appTempData, setAppTempData }) => {
  const [t] = useTranslation("global");

  const setRealtimeStation = (station: string) => {
    setAppTempData("realTimeStation", station);
  };

  const getDefualtStation = async () => {
    if (appTempData.realTimeStation) {
      return appTempData.realTimeStation;
    }
    if (!getPlatforms().includes("hybrid")) {
      return "MTR";
    }
    const currentLocation = await getLocation(t, appData.GPS);
    if (!currentLocation || currentLocation.length === 0) return "MTR";
    return currentLocation[0][0];
  };

  // Run once on initial app load
  useEffect(() => {
    getDefualtStation().then((station) => {
      setRealtimeStation(station);
    });
  }, []);

  return (
    <IonPage>
      {appTempData.realTimeStation ? (
        <RealtimeView
          appData={appData}
          setUserSetRealtimeDest={setRealtimeStation}
          defaultSelectedStation={appTempData.realTimeStation}
        />
      ) : (
        <LoadingImage />
      )}
    </IonPage>
  );
};

export default Realtime;
