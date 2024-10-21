import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { GPSSelectIcon } from "../../Components/gpsSelectBox";
import BusMovingImage from "../../Components/busMovingImage";

import { FaBus } from "react-icons/fa";
import { IconoirProvider, BusStop } from "iconoir-react";

import "./Realtime.css";
import "../assets/routeComp.css";

import { generateRouteResult, BusData } from "../../Functions/getRealTime";
import RouteMap from "../../Components/routeMap";
import PullToRefresh from "react-simple-pull-to-refresh";
import { alertOutline, alertSharp } from "ionicons/icons";
import { RiAlertFill } from "react-icons/ri";

const Realtime: React.FC<{
  appData: any;
  setUserSetRealtimeDest: any;
  defaultSelectedStation: string;
  networkError: boolean;
}> = ({
  appData,
  setUserSetRealtimeDest,
  defaultSelectedStation,
  networkError,
}) => {
  const [t, i18n] = useTranslation("global");
  const [realtimeDest, setRealtimeDest] = useState<string>(
    defaultSelectedStation
  );
  const [realtimeResult, setRealtimeResult] = useState<any>([]);
  const [routeMap, setRouteMap] = useState<any>([]);

  let allBusStop: string[] = [];
  try {
    const stops = Object.values(appData?.bus as BusData).flatMap((busData) =>
      busData.stations?.name.filter((stop) => stop !== undefined)
    );
    allBusStop = Array.from(
      new Set(stops.filter((stop): stop is string => stop !== undefined))
    ).sort();
  } catch (e) {
    console.error(e);
  }

  const importantStations = Object.keys(appData.GPS).filter(
    (key) => appData.GPS[key].ImportantStation !== null
  );

  const generateResult = async (
    stationName: string = realtimeDest,
    log = true
  ) => {
    await generateRouteResult(
      t,
      appData?.bus,
      appData,
      stationName,
      setRealtimeResult,
      importantStations
    );

    if (log) {
      console.log("Realtime request for", stationName);
    }
  };

  useEffect(() => {
    setUserSetRealtimeDest(realtimeDest);

    generateResult(realtimeDest);
  }, [realtimeDest]);

  useEffect(() => {
    generateResult(realtimeDest);
  }, [appData]);

  useEffect(() => {
    generateResult(defaultSelectedStation);
  }, []);

  return (
    <div className="realtime-page">
      <form className="stopselector" method="POST">
        <BusMovingImage />
        <div className="searchStopSelector">
          <span>
            <IconoirProvider
              iconProps={{
                strokeWidth: 2,
                width: "1em",
                height: "1em",
              }}
            >
              <BusStop />
            </IconoirProvider>
          </span>
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
        </div>
      </form>

      <div className="realtimeresult">
        <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />

        {networkError === true && (
          <div className="bus-offline">
            <RiAlertFill className="bus-offline-icon" />
            {t("internet_offline")}
          </div>
        )}
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
                    <span className="direction">{bus.direction}</span>
                  </div>
                  <div className="next-station-display">
                    {bus.nextStation &&
                      (bus.nextStation.importantStationAfter &&
                      bus.nextStation.importantStationAfter.length > 0 ? (
                        <>
                          <p className="next-station-text">
                            {t("next-important-station")}
                          </p>
                          <p className="next-station">
                            {bus.nextStation.importantStationAfter[0]}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="next-station-text">
                            {t("next-station")}
                          </p>
                          <p className="next-station">
                            {t(bus.nextStation.stationName)}
                          </p>
                        </>
                      ))}
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
  );
};

export default Realtime;
