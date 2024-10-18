import {
  IonPage,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import "./RouteSearch.css";
import { BusData, processBusStatus } from "../../Functions/getRealTime";
import { useEffect, useState } from "react";
import {
  busOutline,
  informationCircleOutline,
  locateOutline,
  locationOutline,
  pinOutline,
  timeOutline,
  timeSharp,
} from "ionicons/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import AutoComplete from "../../Components/autoComplete";
import { capitalizeFirstLetter } from "../../Functions/Tools";
import RouteMap from "../../Components/routeMap";
import { GPSSelectIcon } from "../../Components/gpsSelectBox";
import { RouteSelect } from "../../Components/selectRouteForm";
import { calculateRoute } from "../../Functions/getRoute";
import LocationTimeChooser from "./RouteSearchFormTime";
import PullToRefresh from "react-simple-pull-to-refresh";
import { RiBusFill } from "react-icons/ri";

const RouteSearch: React.FC<{
  appData: any;
  appSettings: any;
  appTempData: any;
  setAppTempData: any;
}> = ({ appData, appSettings, appTempData, setAppTempData }) => {
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

  const [routeSearchStart, setRouteSearchStart] = useState<string>(
    appTempData.searchStation?.routeSearchStart ?? ""
  );
  const [routeSearchDest, setRouteSearchDest] = useState<string>(
    appTempData.searchStation?.routeSearchDest ?? ""
  );
  const [departNow, setDepartNow] = useState<boolean>(
    appTempData.searchStation?.departNow ?? true
  );
  const [selectWeekday, setSelectWeekday] = useState<string>(
    appTempData.searchStation?.selectWeekday ??
      "WK-" +
        capitalizeFirstLetter(
          new Date().toLocaleDateString("en-US", { weekday: "short" })
        )
  );
  const [selectDate, setSelectDate] = useState<string>(
    appTempData.searchStation?.selectDate ??
      (new Date().getDay() === 0
        ? "HD"
        : TravelDateOptions && TravelDateOptions[0]
        ? TravelDateOptions[0]
        : "")
  );
  const [selectHour, setSelectHour] = useState<string>(
    appTempData.searchStation?.selectHour ??
      new Date().getHours().toString().padStart(2, "0")
  );
  const [selectMinute, setSelectMinute] = useState<string>(
    appTempData.searchStation?.selectMinute ??
      (Math.floor(new Date().getMinutes() / 5) * 5).toString().padStart(2, "0")
  );

  const [routeResult, setRouteResult] = useState<any>([]);

  const generateRouteResult = () => {
    setAppTempData("searchStation", {
      routeSearchStart,
      routeSearchDest,
      departNow,
      selectWeekday,
      selectDate,
      selectHour,
      selectMinute,
    });

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
        busSchedule,
        appSettings
      )
    );
  };

  async function handleRefresh(): Promise<void> {
    await generateRouteResult();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(void 0);
      }, 1000);
    });
  }

  useEffect(() => {
    generateRouteResult();
  }, [routeSearchStart, routeSearchDest, departNow]);

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
        <div
          className={`route-search-form-container ${
            routeSearchStart === "" ||
            routeSearchDest === "" ||
            (!routeResult.sortedResults && !routeResult.error)
              ? " empty"
              : ""
          }`}
        >
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
            <div className="search-boxes">
              <div className="info-box optionssel">
                <div className="locationChooserContainer">
                  <div className="locationChooser">
                    <label htmlFor="Start" id="Start-label">
                      <IonIcon icon={locateOutline}></IonIcon>
                    </label>
                    <div className="locationinputContainer">
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
                </div>

                <div className="locationChooserContainer">
                  <div className="locationChooser">
                    <label htmlFor="Dest" id="Dest-label">
                      <IonIcon icon={locationOutline}></IonIcon>
                    </label>

                    <div className="locationinputContainer">
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
                </div>

                <div className="routeDotIcon">
                  <BsThreeDotsVertical />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="routeresult">
          <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />

          {fetchError && (
            <div
              id="time-now"
              className="show-time"
              style={{ display: "none" }}
            >
              {t("fetch-error")}
            </div>
          )}
          {routeResult.samestation && (
            <p className="samestation-info">{t("samestation-info")}</p>
          )}

          <PullToRefresh onRefresh={handleRefresh} pullingContent="">
            {routeResult.sortedResults
              ? routeResult.sortedResults.map((result: any, index: number) => {
                  return (
                    <div
                      className="route-result-busno"
                      key={index}
                      onClick={() => {
                        setRouteMap([result.route, result.routeIndex]);
                      }}
                    >
                      <div className="route-result-busno-number-container">
                        <RiBusFill className="route-result-busno-icon" />
                        <div className="route-result-busno-number">
                          {result.busNo}
                        </div>
                      </div>
                      <div className="route-result-busno-details">
                        <div className="route-result-busno-details-route">
                          <div className="route-result-busno-simple-route">
                            <p className="route-result-busno-details-text-label">
                              {t("bus-start-station")}
                            </p>
                            <div className="route-result-busno-details-text-container">
                              <IonIcon icon={locateOutline}></IonIcon>
                              <p className="route-result-busno-details-text-detail">
                                {result.start}
                              </p>
                            </div>
                          </div>
                          <div className="route-result-busno-details-arrivaltime">
                            <p className="route-result-busno-details-text-label">
                              {t("next-bus-arrival-info")}
                            </p>
                            <div className="route-result-busno-details-text-container">
                              <IonIcon icon={timeOutline}></IonIcon>
                              <p className="route-result-busno-details-text-detail">
                                {result.arrivalTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="route-result-busno-details-totaltime">
                        <div>
                          <p className="route-result-busno-details-totaltime-text">
                            {result.time > 1000 ? "N/A" : result.time}
                          </p>
                          {` min`}
                        </div>
                        <p className="route-result-busno-details-waittime-desc">
                          {t("wait-time-desc")}
                        </p>
                      </div>
                    </div>
                  );
                })
              : routeResult.error && (
                  <div className="error-text">
                    <IonIcon icon={informationCircleOutline}></IonIcon>
                    <p>{t(routeResult.message)}</p>
                  </div>
                )}
          </PullToRefresh>
        </div>

        <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />
      </div>
    </IonPage>
  );
};

export default RouteSearch;
