import { getPlatforms, IonPage } from "@ionic/react";

import "./Realtime.css";
import "../assets/routeComp.css";

import { LoadingSuspenseView } from "../../Components/newPageModal";
import RealtimeView from "./RealtimeView";
import { getLocation } from "../../Functions/getLocation";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Realtime: React.FC<{
  appData: any;
}> = ({ appData }) => {
  const [t] = useTranslation("global");
  const [userSetRealtimeDest, setUserSetRealtimeDest] = useState<string | null>(
    null
  );

  const getDefualtStation = async () => {
    if (userSetRealtimeDest) {
      return userSetRealtimeDest;
    }
    if (!getPlatforms().includes("hybrid")) {
      return "MTR";
    }
    const currentLocation = await getLocation(t, appData.GPS);
    if (!currentLocation || currentLocation.length === 0) return "MTR";
    setUserSetRealtimeDest(currentLocation[0][0]);
    return currentLocation[0][0];
  };

  return (
    <IonPage>
      <LoadingSuspenseView
        resolveFunction={getDefualtStation}
        ViewComponent={RealtimeView}
        propNameForResolvedValue="defaultSelectedStation"
        otherProps={{
          appData: appData,
          setUserSetRealtimeDest: setUserSetRealtimeDest,
        }}
      />
    </IonPage>
  );
};

export default Realtime;
