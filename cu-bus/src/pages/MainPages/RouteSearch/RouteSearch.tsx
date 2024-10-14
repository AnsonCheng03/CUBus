import { IonPage, IonIcon } from "@ionic/react";
import "./RouteSearch.css";
import { BusData, processBusStatus } from "../../Functions/getRealTime";
import { useEffect, useState } from "react";
import {
  informationCircleOutline,
  locationOutline,
  pinOutline,
  timeOutline,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import AutoComplete from "../../Components/autoComplete";
import { capitalizeFirstLetter } from "../../Functions/Tools";
import RouteMap from "../../Components/routeMap";
import { GPSSelectIcon } from "../../Components/gpsSelectBox";
import { RouteSelect } from "../../Components/selectRouteForm";
import { calculateRoute } from "../../Functions/getRoute";
import LocationTimeChooser from "./RouteSearchFormTime";

const RouteSearch: React.FC<{ appData: any }> = ({ appData }) => {
  const [routeMap, setRouteMap] = useState<any>([]);
  const [t] = useTranslation("global");

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

  let allBuildings: string[] = [];
  let translatedBuildings: string[] = [];

  try {
    const stops = Object.values(bus).flatMap((busData) =>
      busData.stations?.name.filter((stop) => stop !== undefined)
    );
    const buildings = Object.values(appData.station).flatMap((building: any) =>
      building.filter((stop: any) => stop !== undefined)
    );

    allBuildings = Array.from(
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

  const TravelDateOptions = Array.from(
    new Set(
      Object.values(bus)
        .map((b) => b.schedule?.[3])
        .filter(Boolean)
    )
  ).filter((date) => (date ? !date.includes(",") : []));

  const [routeSearchStart, setRouteSearchStart] = useState<string>("");
  const [routeSearchDest, setRouteSearchDest] = useState<string>("");
  const [departNow, setDepartNow] = useState<boolean>(true);
  const [selectWeekday, setSelectWeekday] = useState<string>(
    "WK-" +
      capitalizeFirstLetter(
        new Date().toLocaleDateString("en-US", { weekday: "short" })
      )
  );
  const [selectDate, setSelectDate] = useState<string>(
    new Date().getDay() === 0
      ? "HD"
      : TravelDateOptions && TravelDateOptions[0]
      ? TravelDateOptions[0]
      : ""
  );
  const [selectHour, setSelectHour] = useState<string>(
    new Date().getHours().toString().padStart(2, "0")
  );
  const [selectMinute, setSelectMinute] = useState<string>(
    (Math.floor(new Date().getMinutes() / 5) * 5).toString().padStart(2, "0")
  );

  const [routeResult, setRouteResult] = useState<any>([]);

  const generateRouteResult = () => {
    if (routeSearchStart === "" || routeSearchDest === "") {
      return;
    }

    setRouteResult(
      calculateRoute(
        t,
        routeSearchStart,
        routeSearchDest,
        "building",
        selectWeekday,
        selectDate,
        selectHour,
        selectMinute,
        departNow,
        filteredBus,
        appData?.station,
        busSchedule
      )
    );
  };

  useEffect(() => {
    generateRouteResult();
  }, [routeSearchStart, routeSearchDest]);

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
      <div className="route-search-page">
        <form
          className="route-search-form"
          name="bussearch"
          method="post"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            generateRouteResult();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              generateRouteResult();
            }
          }}
        >
          <div className="search-boxes">
            <div className="info-box optionssel">
              <div className="locationChooserContainer">
                <div className="locationChooser">
                  <label htmlFor="Start" id="Start-label">
                    <IonIcon icon={pinOutline}></IonIcon>
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
              </div>

              <div className="locationChooserContainer">
                <div className="locationChooser">
                  <label htmlFor="Dest" id="Dest-label">
                    <IonIcon icon={locationOutline}></IonIcon>
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
              </div>

              <LocationTimeChooser
                generateRouteResult={generateRouteResult}
                departNow={departNow}
                setDepartNow={setDepartNow}
                selectWeekday={selectWeekday}
                setSelectWeekday={setSelectWeekday}
                selectDate={selectDate}
                setSelectDate={setSelectDate}
                selectHour={selectHour}
                setSelectHour={setSelectHour}
                selectMinute={selectMinute}
                setSelectMinute={setSelectMinute}
                TravelDateOptions={TravelDateOptions}
              />
            </div>
          </div>
        </form>

        {fetchError && (
          <div id="time-now" className="show-time" style={{ display: "none" }}>
            {t("fetch-error")}
          </div>
        )}

        <div className="routeresult">
          {routeResult.samestation && (
            <p className="samestation-info">{t("samestation-info")}</p>
          )}

          {routeResult.sortedResults ? (
            routeResult.sortedResults.map((result: any, index: number) => {
              return (
                <div
                  className="route-result-busno"
                  key={index}
                  onClick={() => {
                    setRouteMap([result.route, result.routeIndex]);
                  }}
                >
                  <div className="route-result-busno-number">
                    {result.busNo}
                  </div>
                  <div className="route-result-busno-details">
                    <div className="route-result-busno-simple-route">
                      <div className="route-result-busno-simple-route-start">
                        {result.start}
                      </div>
                      <div className="route-result-busno-simple-route-arrow">
                        ➤
                      </div>
                      <div className="route-result-busno-simple-route-end">
                        {result.end}
                      </div>
                    </div>
                    <div className="route-result-busno-details-time">
                      <div className="route-result-busno-details-arrivaltime">
                        {`${t("next-bus-arrival-info")}${result.arrivalTime}, ${
                          result.timeDisplay
                        } ${t("bus-length-info")}`}
                      </div>
                    </div>
                  </div>
                  <div className="route-result-busno-details-totaltime">
                    <p className="route-result-busno-details-totaltime-text">
                      {result.time > 1000 ? "N/A" : result.time}
                    </p>
                    {` min`}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="error-text">
              {routeResult.error ? (
                <>
                  <IonIcon icon={informationCircleOutline}></IonIcon>
                  <p>{t(routeResult.message)}</p>
                </>
              ) : (
                <>
                  <IonIcon icon={informationCircleOutline}></IonIcon>
                  <p>{t("input-text-reminder")}</p>
                </>
              )}
            </div>
          )}
        </div>

        <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />
      </div>
    </IonPage>
  );
};

export default RouteSearch;
