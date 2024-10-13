import { getPlatforms, IonPage } from "@ionic/react";

import "./Realtime.css";
import "../assets/routeComp.css";

import { LoadingSuspenseView } from "../../Components/newPageModal";
import RealtimeView from "./RealtimeView";
import { getLocation } from "../../Functions/getLocation";
import { useTranslation } from "react-i18next";

const Realtime: React.FC<{ appData: any }> = ({ appData }) => {
  const [t] = useTranslation("global");

  const getDefualtStation = async () => {
    if (!getPlatforms().includes("hybrid")) {
      return "MTR";
    }
    const currentLocation = await getLocation(t, appData.GPS);
    if (!currentLocation) return "MTR";
    return currentLocation[0][0];
  };

  return (
    <IonPage>
      <LoadingSuspenseView
        resolveFunction={getDefualtStation}
        ViewComponent={RealtimeView}
        propNameForResolvedValue="defaultSelectedStation"
        otherProps={{ appData: appData }}
      />
    </IonPage>
  );
};

export default Realtime;
