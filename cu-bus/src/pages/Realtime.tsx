import { IonPage, IonIcon } from "@ionic/react";
import { navigateCircleOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getLocation } from "./Functions/getLocation";

import "./Realtime.css";
import "./routeComp.css";

interface BusData {
  [busNumber: string]: {
    schedule: [
      string, // Start time
      string, // End time
      string, // Frequency
      string, // Days type (e.g., "TD,NT")
      string, // Days of the week
      string // Additional notes
    ];
    stations: {
      name: string[];
      attr: string[];
      time: number[];
    };
  };
}

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

  const bus: BusData = appData?.bus;
  let allBusStop: string[] = [];
  try {
    const stops = Object.values(bus).flatMap((busData) =>
      busData.stations.name.filter((stop) => stop !== undefined)
    );
    allBusStop = Array.from(new Set(stops)).sort();
  } catch (e) {
    console.error(e);
  }

  const generateResult = (log = true) => {
    // $busschedule = json_decode(file_get_contents('../Data/timetable.json'), true);
    // $busservices = json_decode(file_get_contents('../Data/Status.json'), true);

    if (log) {
      console.log("Realtime request for", realtimeDest);
    }
    // $currentbusservices = end($busservices);
    // $thirtyminbusservice = array_slice($busservices, -60, 1)[0] ?? [];
    // if (isset($currentbusservices['ERROR'])) {
    //     // alert("alert", $translation["fetch-error"][$lang]);
    //     $bus = filterBusesBySchedule($bus);
    // } else {
    //     $bus = filterBusesBySchedule($bus);
    //     $bus = processBusStatus($currentbusservices, $thirtyminbusservice, $bus);
    // }
    // $outputschedule = array_filter($busschedule, fn($key) => explode("|", $key)[0] == $dest, ARRAY_FILTER_USE_KEY);
    // $allBuses = processAndSortBuses($outputschedule, $bus, $lang, $translation);
    // displayBuses($allBuses, $lang, $translation);
  };

  const handleGetLocation = (item: any) => {
    getLocation(item, t, setSortedGPSData, appData.GPS);
  };

  const changevaluebyGPS = (locCode: string) => {
    setRealtimeDest(locCode);
    sessionStorage.setItem("realtime-Dest", locCode);
    generateResult();
    setSortedGPSData([]);
  };

  return (
    <IonPage>
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
          // mode="station"
          className="select-box"
          name="Dest"
          id="Dest"
          value={realtimeDest}
          onChange={(e) => {
            setRealtimeDest(e.target.value);
            sessionStorage.setItem("realtime-Dest", e.target.value);
            generateResult();
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
      <div className="realtimeresult"></div>

      {/* <div id="detail-route-container">
        <div id="close-button" onClick={() => {closeRouteMap()}}>
          &times;
        </div>
        <div id="map-container">
          <div id="route-bar"></div>
          <div id="start-point" className="endpoint">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <div id="end-point" className="endpoint">
            <i className="fas fa-flag-checkered"></i>
          </div>
        </div>
      </div> */}
    </IonPage>
  );
};

export default Realtime;
