// TODO: auto reload, startup load on gps
import { IonPage, IonIcon } from "@ionic/react";
import { navigateCircleOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getLocation } from "./Functions/getLocation";

import "./Realtime.css";
import "./routeComp.css";
import { generateRouteResult, BusData } from "./Functions/realtimeResult";

interface GPSData
  extends Array<
    [
      string,
      {
        Lat: string;
        Lng: string;
        distance: number;
      }
    ]
  > {}

const Realtime: React.FC<{ appData: any }> = ({ appData }) => {
  const [t, i18n] = useTranslation("global");
  const [sortedGPSData, setSortedGPSData] = useState<GPSData>([]);
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

  // function createRouteMap(route, selectedStationIndex) {
  const createRouteMap = (route: string, selectedStationIndex: number) => {
    setRouteMap([route, selectedStationIndex]);

    // scroll to current station
    const currentStation =
      document.querySelectorAll(".station-container")[
        selectedStationIndex - 1 < 0 ? 0 : selectedStationIndex - 1
      ];
    currentStation.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetLocation = (item: any) => {
    getLocation(item, t, setSortedGPSData, appData.GPS);
  };

  const changevaluebyGPS = (locCode: string) => {
    setRealtimeDest(locCode);
    sessionStorage.setItem("realtime-Dest", locCode);
    setSortedGPSData([]);
  };

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

  useEffect(() => {
    generateResult("MTR");
  }, []);

  return (
    <IonPage>
      <div className="realtime-page">
        {sortedGPSData.length > 0 && (
          <div id="details-box">
            <div className="details-box">
              <div className="showdetails">
                <h4 id="details-box-heading">{t("nearst_txt")}</h4>
                <div
                  className="map-submit-btn"
                  onClick={() => setSortedGPSData([])}
                >
                  {t("cancel_btntxt")}
                </div>
              </div>
              <div id="GPSresult">
                {sortedGPSData.slice(0, 3).map((data) => {
                  return (
                    <div
                      className="gpsOptions"
                      key={data[0]}
                      onClick={() => {
                        changevaluebyGPS(data[0]);
                      }}
                    >
                      <div className="GpsText">
                        {data[0].includes("|")
                          ? t(data[0].split("|")[0]) +
                            " (" +
                            t(data[0].split("|")[1]) +
                            ")"
                          : t(data[0])}
                      </div>
                      <div className="gpsMeter">
                        {Number(data[1].distance.toFixed(3)) * 1000 > 1000
                          ? "> 9999"
                          : Number(data[1].distance.toFixed(3)) * 1000 + " m"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
          <IonIcon
            icon={navigateCircleOutline}
            className="image-wrapper"
            id="Dest-GPS-box"
            onClick={() => {
              handleGetLocation("Dest-GPS-box");
            }}
          ></IonIcon>
        </form>
        <div className="realtimeresult">
          {routeMap && routeMap.length > 0 && (
            <div id="detail-route-container">
              <div
                id="close-button"
                onClick={() => {
                  setRouteMap([]);
                }}
              >
                &times;
              </div>

              <div id="map-container">
                {routeMap[0].map((station: string, index: number) => {
                  return (
                    <div
                      className={
                        "station-container-wrapper" +
                        (index < routeMap[1] ? " completed" : "")
                      }
                      key={station}
                    >
                      <div className="station-container">
                        <div className="station-number">{index + 1}</div>
                        <div className="station-name">{station}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                      createRouteMap(
                        bus.nextStation.route,
                        bus.nextStation.startIndex
                      );
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
