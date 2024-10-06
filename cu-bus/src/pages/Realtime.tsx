// TODO: startup load on gps
import { IonPage, IonIcon, getPlatforms } from "@ionic/react";
import { navigateCircleOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { GPSSelectIcon } from "./Components/gpsSelectBox";

import "./Realtime.css";
import "./routeComp.css";

import { generateRouteResult, BusData, GPSData } from "./Functions/getRealTime";
import RouteMap from "./Components/routeMap";
import { getLocation } from "./Functions/getLocation";

const Realtime: React.FC<{ appData: any }> = ({ appData }) => {
  const [t, i18n] = useTranslation("global");
  const [realtimeDest, setRealtimeDest] = useState<string>("MTR");
  const [realtimeResult, setRealtimeResult] = useState<any>([]);
  const [routeMap, setRouteMap] = useState<any>([]);

  const bus: BusData = appData?.bus;
  let allBusStop: string[] = [];
  try {
    const stops = Object.values(bus).flatMap((busData) =>
      busData.stations?.name.filter((stop) => stop !== undefined)
    );
    allBusStop = Array.from(
      new Set(stops.filter((stop): stop is string => stop !== undefined))
    ).sort();
  } catch (e) {
    console.error(e);
  }

  const generateResult = (stationName: string = realtimeDest, log = true) => {
    generateRouteResult(t, bus, appData, stationName, setRealtimeResult);

    if (log) {
      console.log("Realtime request for", stationName);
    }
  };

  useEffect(() => {
    generateResult(realtimeDest);

    const intervalId = setInterval(() => {
      generateResult(realtimeDest, false); // This will use the latest stationName
    }, 5000);

    return () => clearInterval(intervalId);
  }, [realtimeDest]);

  const mobileGetLocation = async (GPSData: GPSData) => {
    if (!getPlatforms().includes("hybrid")) return;

    const currentLocation = await getLocation(t, GPSData);
    if (!currentLocation) return;

    setRealtimeDest(currentLocation[0][0]);
  };

  useEffect(() => {
    generateResult("MTR");

    mobileGetLocation(appData.GPS);
  }, []);

  return (
    <IonPage>
      <div className="realtime-page">
        <form className="stopselector" method="POST">
          <span>{t("DescTxt-yrloc")}</span>
          <select
            className="select-box"
            name="Dest"
            id="Dest"
            value={realtimeDest}
            onChange={(e) => {
              setRealtimeDest(e.target.value);
            }}
          >
            {allBusStop.map((stop) => (
              <option key={stop} value={stop}>
                {t(stop)}
              </option>
            ))}
          </select>
          <GPSSelectIcon appData={appData} setDest={setRealtimeDest} />
        </form>
        <div className="realtimeresult">
          <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />

          <div className="bus-grid">
            {realtimeResult.length === 0 ? (
              <div className="no-bus">
                <div className="no-bus-icon">
                  <i className="fa-solid fa-ban"></i>
                </div>
                <p>{t("No-bus-time")}</p>
              </div>
            ) : (
              realtimeResult.slice(0, 10).map((bus: any) => {
                return (
                  <div
                    className={"bus-row" + (bus.arrived ? " arrived" : "")}
                    onClick={() => {
                      setRouteMap([
                        bus.nextStation.route,
                        bus.nextStation.startIndex,
                      ]);
                    }}
                    key={bus.busno + bus.time}
                  >
                    <div className="bus-info">
                      <span className="bus-name">{bus.busno}</span>
                      <span className="direction">
                        {bus.direction !== t("mode-realtime") ? <br /> : ""}
                        {bus.direction}
                      </span>
                    </div>
                    <div className="next-station-display">
                      <p className="next-station-text">{t("next-station")}</p>
                      {bus.nextStation && (
                        <p className="next-station">
                          {t(bus.nextStation.stationName)}
                        </p>
                      )}
                      {bus.warning && (
                        <>
                          <span></span>
                          <span className="warning">{t(bus.warning)}</span>
                        </>
                      )}
                    </div>
                    <div className="arrival-time">{bus.time}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Realtime;
