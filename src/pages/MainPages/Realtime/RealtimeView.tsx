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
import {
  alertCircleOutline,
  alertOutline,
  alertSharp,
  caretDownCircleOutline,
  caretUpCircleOutline,
} from "ionicons/icons";
import { RiAlertFill } from "react-icons/ri";
import { getTextColor } from "../../Functions/Tools";

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

  const displayAllBus = true;

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
      importantStations,
      displayAllBus
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
              <IonIcon icon={alertCircleOutline} />
              <p>{t("No-bus-time")}</p>
            </div>
          ) : (
            realtimeResult.map((bus: any) => {
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
                    <div className="route-result-busno-number-container">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                        className="route-result-busno-icon"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17 20H7V21C7 21.5523 6.55228 22 6 22H5C4.44772 22 4 21.5523 4 21V20H3V12H2V8H3V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V8H22V12H21V20H20V21C20 21.5523 19.5523 22 19 22H18C17.4477 22 17 21.5523 17 21V20ZM5 5V14H19V5H5ZM5 16V18H9V16H5ZM15 16V18H19V16H15Z"></path>

                        <g>
                          <rect
                            x="5"
                            y="5"
                            width="14"
                            height="9"
                            fill={bus.config?.colorCode}
                          ></rect>
                          <text
                            x="50%"
                            y="10px"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fontSize="7"
                            // fontWeight={600}
                            fill={getTextColor(bus.config?.colorCode)}
                          >
                            {bus.busno}
                          </text>
                        </g>
                      </svg>
                      <span className="direction">
                        {bus.direction &&
                          (bus.direction === "DOWNST" ? (
                            <IonIcon
                              icon={caretDownCircleOutline}
                              style={{
                                color: "rgb(234, 72, 64)",
                              }}
                            />
                          ) : (
                            <IonIcon
                              icon={caretUpCircleOutline}
                              style={{
                                color: "green",
                              }}
                            />
                          ))}
                      </span>
                    </div>
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
