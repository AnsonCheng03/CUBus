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
}> = ({ appData }) => {
  const [t] = useTranslation("global");
  const [userSetRealtimeDest, setUserSetRealtimeDest] = useState<string | null>(
    null
  );

  const getDefualtStation = useCallback(async () => {
    if (userSetRealtimeDest) {
      return userSetRealtimeDest;
    }
    if (!getPlatforms().includes("hybrid")) {
      return "MTR";
    }
    const currentLocation = await getLocation(t, appData.GPS);
    if (!currentLocation || currentLocation.length === 0) return "MTR";
    return currentLocation[0][0];
  }, [userSetRealtimeDest, appData]);

  // Run once on initial app load
  useEffect(() => {
    getDefualtStation().then((station) => {
      setUserSetRealtimeDest(station);
    });
  }, [getDefualtStation]);

  return (
    <IonPage>
      {userSetRealtimeDest ? (
        <RealtimeView
          appData={appData}
          setUserSetRealtimeDest={setUserSetRealtimeDest}
          defaultSelectedStation={userSetRealtimeDest}
        />
      ) : (
        <LoadingImage />
      )}
    </IonPage>
  );
};

export default Realtime;
