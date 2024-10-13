import { getPlatforms, IonPage } from "@ionic/react";
import { Suspense, useEffect, useState } from "react";

import "./Realtime.css";
import "../assets/routeComp.css";

import { LoadingImage } from "../../Components/newPageModal";
import RealtimeView from "./RealtimeView";
import { getLocation } from "../../Functions/getLocation";
import { useTranslation } from "react-i18next";
import { Await } from "@remix-run/react";

const Realtime: React.FC<{ appData: any }> = ({ appData }) => {
  const [t, i18n] = useTranslation("global");

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
      <Suspense fallback={<LoadingImage />}>
        <Await resolve={getDefualtStation()}>
          {(resolvedValue) => (
            <RealtimeView
              appData={appData}
              defaultSelectedStation={resolvedValue}
            />
          )}
        </Await>
      </Suspense>
    </IonPage>
  );
};

export default Realtime;
