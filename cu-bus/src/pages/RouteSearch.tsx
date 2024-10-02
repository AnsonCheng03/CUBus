import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
} from "@ionic/react";
import "./RouteSearch.css";
import { BusData, GPSData, processBusStatus } from "./Functions/generalRoute";
import { getLocation } from "./Functions/getLocation";
import { useState } from "react";
import {
  informationCircleOutline,
  navigateCircleOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import AutoComplete from "./Functions/autoComplete";

const RouteSearch: React.FC<{ appData: any }> = ({ appData }) => {
  const [routeMap, setRouteMap] = useState<any>([]);
  const [sortedGPSData, setSortedGPSData] = useState<GPSData>([]);
  const [t, i18n] = useTranslation("global");

  const bus: BusData = appData?.bus;
  const busSchedule = appData["timetable.json"];
  const busServices = appData["Status.json"];

  const busServiceKeys = Object.keys(busServices);
  const currentBusServices =
    busServiceKeys.length > 0
      ? busServices[busServiceKeys[busServiceKeys.length - 1]]
      : [];
  const thirtyMinBusService =
    busServiceKeys.length >= 60
      ? busServices[busServiceKeys[busServiceKeys.length - 60]]
      : [];

  // need double check realtime side
  let fetchError = false;
  let filteredBus = { ...bus };
  if (busServices["ERROR"]) {
    fetchError = true;
  } else {
    filteredBus = processBusStatus(
      currentBusServices,
      thirtyMinBusService,
      filteredBus
    );
  }

  const changevaluebyGPS = (locCode: string) => {
    // setRealtimeDest(locCode);
    // sessionStorage.setItem("realtime-Dest", locCode);
    // setSortedGPSData([]);
  };

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

  let allBuildings: string[] = [];
  let translatedBuildings: string[] = [];

  try {
    const buildings = Object.values(appData.station).flatMap((building: any) =>
      building.filter((stop: any) => stop !== undefined)
    );

    allBuildings = Array.from(
      new Set(buildings.filter((stop): stop is string => stop !== undefined))
    ).sort();

    translatedBuildings = allBuildings
      .map((building) => {
        const buildingName = t(building);
        return buildingName !== ""
          ? `${buildingName} (${building.toUpperCase()})`
          : "";
      })
      .filter((name) => name !== "");
  } catch (e) {
    console.error(e);
  }

  return (
    <IonPage>
      {/* <?php


//Alert Delay Bus
foreach ($bus as $busnum => $busline) {

  if ($busline["stats"]["status"] == "no" && $busline["stats"]["prevstatus"] == "normal")
    $buserrstat["justeos"][] = $busnum;

  if ($busline["stats"]["status"] == "delay")
    $buserrstat["delay"][] = $busnum;
  if ($busline["stats"]["status"] == "suspended")
    $buserrstat["suspended"][] = $busnum;
}

$finalerrbus = "";
if (isset($buserrstat["delay"]))
  $finalerrbus = $finalerrbus . $translation["delay-alert"][$lang] . implode(", ", $buserrstat["delay"]);
if (isset($buserrstat["delay"]) && isset($buserrstat["suspended"]))
  $finalerrbus = $finalerrbus . "<br>";
if (isset($buserrstat["suspended"]))
  $finalerrbus = $finalerrbus . $translation["suspended-alert"][$lang] . implode(", ", $buserrstat["suspended"]);
// if ($finalerrbus !== "")
//   alert("alert", $finalerrbus);

?>


<script>
  // submit the form when the enter key is pressed or changed (event listener)
  const autoSubmitForm = () => {
    // log both locationinput and slider value
    const from = document.querySelector('#Startbd').value;
    const to = document.querySelector('#Destbd').value;
    const slider = document.querySelector('.slider-container input').checked;

    if (from === "" || to === "" || slider === false) {
      return;
    }
    // submit the form
    document.querySelector('#routesubmitbtn').click();
  }

  // add event listener to the form
  document.querySelector('form').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      autoSubmitForm();
    }
  });

  document.querySelectorAll('.slider-container').forEach(element => {
    // only 
    element.addEventListener('change', autoSubmitForm);
  });


</script>

*/}

      {/* <div class="routeresult">
  <div class='error-text'>
    <i class='fas fa-info-circle''></i>
    <p> <?php echo $translation["input-text-reminder"][$lang] ?></p>
  </div>
    </div> */}

      <form
        name="bussearch"
        method="post"
        autoComplete="off"
        onSubmit={(e) => {
          // return submitform(this, ".routeresult", "routesearch/index.php");
        }}
      >
        <input
          id="building"
          name="mode"
          type="radio"
          value="building"
          defaultChecked
          hidden
        />
        <div className="search-boxes">
          <div className="info-box optionssel">
            <div className="locationchooser">
              <label htmlFor="Start" id="Start-label">
                {t("Form-Start")}
              </label>
              <div className="locationinput">
                <AutoComplete allBuildings={translatedBuildings} />
              </div>
              <div className="functionbuttons">
                <IonIcon
                  icon={navigateCircleOutline}
                  className="image-wrapper"
                  id="Start-GPS-box"
                  onClick={() => {
                    getLocation(
                      "Start-GPS-box",
                      t,
                      setSortedGPSData,
                      appData.GPS
                    );
                  }}
                />
              </div>
            </div>

            <div className="locationchooser">
              <label htmlFor="Dest" id="Dest-label">
                {t("Form-Dest")}
              </label>
              <div className="locationinput">
                <AutoComplete allBuildings={translatedBuildings} />
              </div>
              <div className="functionbuttons">
                <IonIcon
                  icon={navigateCircleOutline}
                  className="image-wrapper"
                  id="Dest-GPS-box"
                  onClick={() => {
                    getLocation(
                      "Dest-GPS-box",
                      t,
                      setSortedGPSData,
                      appData.GPS
                    );
                  }}
                />
              </div>
            </div>

            <div className="bus-options">
              <span className="slider-wrapper">
                <label htmlFor="deptnow">{t("info-deptnow")}</label>
                <div className="slider-container">
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="deptnow"
                      name="deptnow"
                      checked
                      onChange={() => {
                        // time_change();
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </span>
            </div>

            <div id="time-schedule" style={{ display: "none" }}>
              <div className="time-schedule">
                <select
                  className="select-date"
                  name="Trav-wk"
                  id="Trav-wk"
                  onChange={() => {
                    // date_change();
                  }}
                >
                  {[
                    "WK-Sun",
                    "WK-Mon",
                    "WK-Tue",
                    "WK-Wed",
                    "WK-Thu",
                    "WK-Fri",
                    "WK-Sat",
                  ].map((weekdays, value) => (
                    <option
                      key={weekdays}
                      value={weekdays}
                      {...(new Date().getDay() === value && {
                        defaultChecked: true,
                      })}
                    >
                      {t(weekdays)}
                    </option>
                  ))}
                </select>
                <select className="select-date" name="Trav-dt" id="Trav-dt">
                  {/* 
            <?php
            $busdate = array_filter(array_unique(array_column(array_column($bus, 'schedule'), 3)));
            foreach ($busdate as $value)
              if (strpos($value, ",") == false)
                echo '<option value="' . $value . '">' . $translation[$value][$lang] . "</option>";
            ?>
          */}
                </select>
                <select className="select-time" name="Trav-hr" id="Trav-hr">
                  {[
                    "00",
                    "01",
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                    "20",
                    "21",
                    "22",
                    "23",
                  ].map((value) => (
                    <option
                      key={value}
                      value={value}
                      {...(new Date().getHours() === parseInt(value) && {
                        defaultChecked: true,
                      })}
                    >
                      {value}
                    </option>
                  ))}
                </select>
                :
                <select className="select-time" name="Trav-min" id="Trav-min">
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((value) => (
                    <option
                      key={value}
                      value={value}
                      {...(parseInt(value) >= new Date().getMinutes() &&
                        parseInt(value) < new Date().getMinutes() + 5 && {
                          defaultChecked: true,
                        })}
                    >
                      {value}
                    </option>
                  ))}
                </select>
                <input
                  id="routesubmitbtn"
                  className="submit-btn"
                  type="submit"
                  value={t("route-submit")}
                />
              </div>
              {fetchError && (
                <div
                  id="time-now"
                  className="show-time"
                  style={{ display: "none" }}
                >
                  {t("fetch-error")}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="routeresult">
        <div className="error-text">
          <IonIcon icon={informationCircleOutline}></IonIcon>
          <p>{t("input-text-reminder")}</p>
        </div>
      </div>

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
    </IonPage>
  );
};

export default RouteSearch;
