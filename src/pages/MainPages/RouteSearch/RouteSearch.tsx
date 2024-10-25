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
  warningOutline,
} from "ionicons/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import AutoComplete from "../../Components/autoComplete";
import { capitalizeFirstLetter, getTextColor } from "../../Functions/Tools";
import RouteMap from "../../Components/routeMap";
import { GPSSelectIcon } from "../../Components/gpsSelectBox";
import { RouteSelect } from "../../Components/selectRouteForm";
import { calculateRoute } from "../../Functions/getRoute";
import LocationTimeChooser from "./RouteSearchFormTime";
import PullToRefresh from "react-simple-pull-to-refresh";
import { RiAlertFill, RiBusFill } from "react-icons/ri";
import axios from "axios";

const RouteSearch: React.FC<{
  appData: any;
  appSettings: any;
  appTempData: any;
  setAppTempData: any;
  networkError: boolean;
}> = ({ appData, appSettings, appTempData, setAppTempData, networkError }) => {
  const [routeMap, setRouteMap] = useState<any>([]);
  const { t, i18n } = useTranslation("global");

  // need double check realtime side
  const [fetchError, setFetchError] = useState(false);

  let allBuildings: string[] = [];
  let translatedBuildings: string[] = [];

  try {
    const stops = Object.values(appData?.bus as BusData).flatMap((busData) =>
      busData.stations?.name.filter((stop) => stop !== undefined)
    );
    const buildings = Object.values(appData.station).flatMap((building: any) =>
      building.filter((stop: any) => stop !== undefined)
    );

    allBuildings = Array.from(
      new Set([
        ...stops.filter((stop): stop is string => stop !== undefined).sort(),
        ...buildings
          .filter((stop): stop is string => stop !== undefined)
          .sort(),
      ])
    );

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
      Object.values(appData.bus as BusData)
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

    let filteredBus = { ...appData.bus };
    filteredBus = processBusStatus(
      currentBusServices,
      thirtyMinBusService,
      filteredBus,
      setFetchError
    );

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
        appData["timetable.json"],
        appSettings,
        logRequest
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

  const logRequest = async (
    routeSearchStart: string,
    routeSearchDest: string,
    departNow: boolean
  ) => {
    console.log("Logging search request", routeSearchStart, routeSearchDest);
    if (!routeSearchStart || !routeSearchDest) return;
    try {
      await axios.post<{}>(
        (import.meta.env.VITE_BASE_URL ??
          "https://cu-bus.online/api/v1/functions") + "/logData.php",
        {
          type: "search",
          Start: routeSearchStart,
          Dest: routeSearchDest,
          Departnow: departNow,
          Lang: i18n.language,
          Token: appData.token ?? "",
        },
        {
          timeout: 10000,
        }
      );
      console.log("Logged search request");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generateRouteResult();
  }, [routeSearchStart, routeSearchDest, departNow]);

  return (
    <IonPage>
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

          {networkError === true && (
            <div className="bus-offline">
              <RiAlertFill className="bus-offline-icon" />
              {t("internet_offline")}
            </div>
          )}
          {fetchError === true && (
            <div className="bus-offline">
              <RiAlertFill className="bus-offline-icon" />
              {t("fetch-error")}
            </div>
          )}
          {routeResult.samestation && (
            <div className="bus-offline">
              <RiAlertFill className="bus-offline-icon" />
              {t("samestation-info")}
            </div>
          )}

          <PullToRefresh onRefresh={handleRefresh} pullingContent="">
            {routeResult.sortedResults
              ? routeResult.sortedResults
                  .slice(0, 15)
                  .map((result: any, index: number) => {
                    return (
                      <div
                        className="route-result-busno"
                        key={index}
                        onClick={() => {
                          setRouteMap([
                            result.route,
                            result.routeIndex,
                            {
                              busNo: result.busNo,
                              stationIndex: result.routeIndex,
                              token: appData.token,
                            },
                          ]);
                        }}
                      >
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
                                fill={result.config?.colorCode}
                              ></rect>
                              <text
                                x="50%"
                                y="10px"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                fontSize="7"
                                fontWeight={600}
                                fill={getTextColor(result.config?.colorCode)}
                              >
                                {result.busNo}
                              </text>
                            </g>
                          </svg>
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
                          <div className="route-result-busno-details-totaltime-container">
                            <p className="route-result-busno-details-totaltime-text">
                              {result.outputTime > 1000
                                ? "N/A"
                                : result.outputTime}
                            </p>
                            {` min`}
                          </div>
                          <p className="route-result-busno-details-waittime-desc">
                            {t("wait-time-desc")}
                          </p>
                        </div>
                        {result.warning && (
                          <div className="route-result-busno-details-warning-container">
                            <IonIcon icon={warningOutline}></IonIcon>
                            <p className="route-result-busno-details-text-detail">
                              {t(result.warning)}
                            </p>
                          </div>
                        )}
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
