import { IonPage, IonIcon } from "@ionic/react";
import "./RouteSearch.css";
import { BusData, processBusStatus } from "./Functions/generalRoute";
import { useState } from "react";
import { informationCircleOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import AutoComplete from "./Components/autoComplete";
import { capitalizeFirstLetter } from "./Functions/Tools";
import RouteMap from "./Components/routeMap";
import { GPSSelectIcon } from "./Components/gpsSelectBox";

const RouteSearch: React.FC<{ appData: any }> = ({ appData }) => {
  const [routeMap, setRouteMap] = useState<any>([]);
  const [t] = useTranslation("global");
  const [routeSearchStart, setRouteSearchStart] = useState<string>("");
  const [routeSearchDest, setRouteSearchDest] = useState<string>("");

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

  let translatedBuildings: string[] = [];

  try {
    const stops = Object.values(bus).flatMap((busData) =>
      busData.stations?.name.filter((stop) => stop !== undefined)
    );
    const buildings = Object.values(appData.station).flatMap((building: any) =>
      building.filter((stop: any) => stop !== undefined)
    );

    const allBuildings = Array.from(
      new Set([
        ...stops.filter((stop): stop is string => stop !== undefined),
        ...buildings.filter((stop): stop is string => stop !== undefined),
      ])
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

  // const autoSubmitForm = () => {
  //   // log both locationinput and slider value
  //   const from = document.querySelector("#Startbd").value;
  //   const to = document.querySelector("#Destbd").value;
  //   const slider = document.querySelector(".slider-container input").checked;

  //   if (from === "" || to === "" || slider === false) {
  //     return;
  //   }
  //   // submit the form
  //   document.querySelector("#routesubmitbtn").click();
  // };

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

*/}

      <form
        name="bussearch"
        method="post"
        autoComplete="off"
        onSubmit={(e) => {
          // return submitform(this, ".routeresult", "routesearch/index.php");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // autoSubmitForm();
          }
        }}
      >
        <div className="search-boxes">
          <div className="info-box optionssel">
            <div className="locationchooser">
              <label htmlFor="Start" id="Start-label">
                {t("Form-Start")}
              </label>
              <div className="locationinput">
                <AutoComplete
                  allBuildings={translatedBuildings}
                  inputState={routeSearchStart}
                  setInputState={setRouteSearchStart}
                />
              </div>
              <div className="functionbuttons">
                <GPSSelectIcon
                  appData={appData}
                  setDest={setRouteSearchStart}
                  fullName
                />
              </div>
            </div>

            <div className="locationchooser">
              <label htmlFor="Dest" id="Dest-label">
                {t("Form-Dest")}
              </label>
              <div className="locationinput">
                <AutoComplete
                  allBuildings={translatedBuildings}
                  inputState={routeSearchDest}
                  setInputState={setRouteSearchDest}
                />
              </div>
              <div className="functionbuttons">
                <GPSSelectIcon
                  appData={appData}
                  setDest={setRouteSearchDest}
                  fullName
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
                      defaultChecked
                      onChange={(e) => {
                        const timeNow = document.getElementById("time-now");
                        const timeSchedule =
                          document.getElementById("time-schedule");

                        if (e.target.checked) {
                          if (timeNow) timeNow.style.display = "block";
                          if (timeSchedule) timeSchedule.style.display = "none";
                        } else {
                          if (timeNow) timeNow.style.display = "none";
                          if (timeSchedule)
                            timeSchedule.style.display = "block";
                        }

                        // autoSubmitForm();
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
                  defaultValue={
                    "WK-" +
                    capitalizeFirstLetter(
                      new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    )
                  }
                  onChange={() => {
                    const TravWk = document.getElementById(
                      "Trav-wk"
                    ) as HTMLSelectElement;
                    const TravDt = document.getElementById(
                      "Trav-dt"
                    ) as HTMLSelectElement;
                    if (TravWk) {
                      if (TravWk.value === "WK-Sun") {
                        TravDt.style.display = "none";
                        TravDt.value = "HD";
                      } else {
                        TravDt.style.display = "inline";
                      }
                    }
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
                    <option key={weekdays} value={weekdays}>
                      {t(weekdays)}
                    </option>
                  ))}
                </select>
                <select className="select-date" name="Trav-dt" id="Trav-dt">
                  {Array.from(
                    new Set(
                      Object.values(bus)
                        .map((b) => b.schedule?.[3])
                        .filter(Boolean)
                    )
                  )
                    .filter((date) => (date ? !date.includes(",") : []))
                    .map((date) => {
                      return date ? (
                        <option key={date} value={date}>
                          {t(date)}
                        </option>
                      ) : null;
                    })}
                </select>
                <select
                  className="select-time"
                  name="Trav-hr"
                  id="Trav-hr"
                  defaultValue={new Date()
                    .getHours()
                    .toString()
                    .padStart(2, "0")}
                >
                  {Array.from({ length: 24 }, (_, i) =>
                    i.toString().padStart(2, "0")
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                :
                <select
                  className="select-time"
                  name="Trav-min"
                  id="Trav-min"
                  defaultValue={(Math.floor(new Date().getMinutes() / 5) * 5)
                    .toString()
                    .padStart(2, "0")}
                >
                  {Array.from({ length: 12 }, (_, i) =>
                    (i * 5).toString().padStart(2, "0")
                  ).map((value) => (
                    <option key={value} value={value}>
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

      <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />
    </IonPage>
  );
};

export default RouteSearch;
