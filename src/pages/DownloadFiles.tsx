import React, { useEffect, useState } from "react";
import { IonButton, IonPage } from "@ionic/react";
import axios from "axios";
import "./DownloadFiles.css";

import { useTranslation } from "react-i18next";

import icon from "../assets/bus.jpg";

import gps from "../initDatas/gps.json";
import Route from "../initDatas/Route.json";
import station from "../initDatas/station.json";
import notice from "../initDatas/notice.json";
import website from "../initDatas/website.json";
import translation from "../initDatas/translation.json";
import timetable from "../initDatas/timetable.json";
import lastModifiedDates from "../initDatas/lastModifiedDates.json";

import { Storage } from "@ionic/storage";
import { LoadingImage } from "./Components/newPageModal";
const store = new Storage();

interface DownloadFilesProps {
  setDownloadedState: (isDownloaded: boolean) => void;
  i18next: any;
  appData: any;
  setAppData: any;
  setAppSettings: any;
  setNetworkError: any;
  setRealtimeData: any;
}

interface ServerResponse {
  bus?: any;
  translation?: {
    en: { [key: string]: string };
    zh: { [key: string]: string };
  };
  station?: any;
  notice?: any;
  GPS?: any;
  WebsiteLinks?: any;
  modificationDates?: ModificationDates;
  [key: string]: any; // Add this line to allow indexing with a string
}

interface ModificationDates {
  [key: string]: string;
}

const DownloadFiles: React.FC<DownloadFilesProps> = ({
  setDownloadedState,
  i18next,
  appData,
  setAppData,
  setAppSettings,
  setNetworkError,
  setRealtimeData,
}) => {
  const { t } = useTranslation("preset");

  const apiUrl =
    import.meta.env.VITE_BASE_URL && process.env.NODE_ENV !== "production"
      ? import.meta.env.VITE_BASE_URL
      : "https://cu-bus.online/api/v1/functions";

  const [downloadHint, setDownloadHint] = useState<string>(
    t("DownloadFiles-Initializing")
  );

  const [downloadError, setDownloadError] = useState<boolean>(false);

  const fetchDatabaseRealtimeUpdate = async () => {
    try {
      const response = await axios.get<ServerResponse>(
        apiUrl + "/getRealtimeData.php",
        {
          timeout: 5000,
        }
      );

      const serverData = response.data;
      setRealtimeData(serverData);
      setNetworkError((prev: any) => {
        return { ...prev, realtime: false };
      });
    } catch (error: any) {
      console.error(error);
      setNetworkError((prev: any) => {
        return { ...prev, realtime: true };
      });
    }
  };

  const fetchDatabaseLastUpdated = async (
    currentDates: ModificationDates | null
  ) => {
    try {
      setDownloadHint(t("DownloadFiles-Downloading"));
      const response = await axios.get<ModificationDates>(
        apiUrl + "/getClientData.php",
        {
          timeout: 5000,
        }
      );
      const serverDates = response.data;

      // Fetch and process all data, regardless of update status
      await fetchData(currentDates, serverDates);

      setDownloadHint(t("DownloadFiles-Complete"));
      setDownloadedState(true);
    } catch (error: any) {
      console.error(error);
      // check error type if its network error or server error
      if (
        error.code === "ERR_BAD_REQUEST" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ECONNRESET" ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message.includes("timeout")
      ) {
        setNetworkError((prev: any) => {
          return { ...prev, batch: true };
        });
        // const serverDates = lastModifiedDates;
        const localStoredDates = JSON.parse(
          await store.get("lastModifiedDates")
        );
        const serverDates = localStoredDates ?? lastModifiedDates;
        await fetchData(currentDates, serverDates, true);
        setDownloadHint(t("DownloadFiles-Complete"));
        setDownloadedState(true);
      } else {
        console.error(error);
        setDownloadHint(t("DownloadFiles-Error"));
        setDownloadError(true);
      }
    }
  };

  const fetchData = async (
    currentDates: ModificationDates | null,
    serverDates: ModificationDates,
    networkError: boolean = false
  ) => {
    try {
      setDownloadHint(t("DownloadFiles-Fetching-Latest"));

      const response =
        networkError === true
          ? {
              data: {
                lastModifiedDates,
              },
            }
          : await axios.post<ServerResponse>(
              apiUrl + "/getClientData.php",
              currentDates,
              {
                timeout: 10000,
              }
            );

      if (!networkError) {
        setNetworkError((prev: any) => {
          return { ...prev, batch: false };
        });
      }

      setDownloadHint(t("DownloadFiles-Processing"));

      // Process all data, whether it's newly downloaded or existing
      let translateHandled = false;
      for (let table in serverDates) {
        if (
          table === "translateroute" ||
          table === "translatewebsite" ||
          table === "translatebuilding" ||
          table === "translateattribute"
        ) {
          table = "translation";
          if (translateHandled) {
            continue;
          } else {
            translateHandled = true;
          }
        }

        let tableData;
        if ((response.data as ServerResponse)[table]) {
          // Data was downloaded
          tableData = (response.data as ServerResponse)[table];
          if (table !== "timetable.json")
            await store.set(`data-${table}`, JSON.stringify(tableData));
        } else {
          // Data wasn't downloaded, fetch from local storage
          // check if data is in storage
          tableData = await JSON.parse(await store.get(`data-${table}`));
          if (networkError && !tableData) {
            switch (table) {
              case "translation":
                tableData = translation;
                break;
              case "website":
                tableData = website;
                break;
              case "Route":
                tableData = Route;
                break;
              case "gps":
                tableData = gps;
                break;
              case "notice":
                tableData = notice;
                break;
              case "station":
                tableData = station;
                break;
              case "timetable.json":
                tableData = timetable;
                break;
              default:
                console.log(`Unknown table: ${table}`);
            }
          }
        }

        // Process and store the data
        if (tableData) {
          await processTableData(table, tableData);
        }
      }

      if ("token" in response.data) {
        await processTableData("token", response.data.token);
      }

      // Update local storage with new modification dates
      if ("modificationDates" in response.data) {
        await store.set(
          "lastModifiedDates",
          JSON.stringify(response.data.modificationDates)
        );
      }

      setDownloadHint(t("StoreFile-Complete"));
    } catch (error: any) {
      if (
        error.code === "ERR_BAD_REQUEST" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ECONNRESET" ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message.includes("timeout")
      ) {
        console.log(error.message);
        setNetworkError((prev: any) => {
          return { ...prev, batch: true };
        });
      } else {
        setDownloadHint(t("StoreFile-Error"));
        console.error(error);
        setDownloadError(true);
      }
    }
  };

  const processTableData = async (table: string, data: any) => {
    switch (table) {
      case "translation":
        i18next.addResourceBundle("en", "global", data.en);
        i18next.addResourceBundle("zh", "global", data.zh);
        break;
      case "website":
        setAppData((prev: any) => {
          return { ...prev, ["WebsiteLinks"]: data };
        });
        break;
      case "Route":
        setAppData((prev: any) => {
          return { ...prev, ["bus"]: data };
        });
        break;
      case "gps":
        setAppData((prev: any) => {
          return { ...prev, ["GPS"]: data };
        });
        break;
      case "notice":
        setAppData((prev: any) => {
          return { ...prev, [table]: data };
        });
        break;
      case "station":
        setAppData((prev: any) => {
          return { ...prev, [table]: data };
        });
        break;
      case "timetable.json":
        setAppData((prev: any) => {
          return {
            ...prev,
            [table]: data,
          };
        });
        break;
      case "token":
        setAppData((prev: any) => {
          return {
            ...prev,
            ["token"]: data,
          };
        });
        break;
      default:
        console.log(`Unknown table: ${table}`);
    }
  };

  const initializeData = async () => {
    await store.create();
    let currentDates: ModificationDates | null = null;

    try {
      const appSettings = await store.get("appSettings");
      if (appSettings) {
        setAppSettings(appSettings);
      }
    } catch (error) {
      console.error(error);
      await store.clear();
    }

    const storedDates = await store.get("lastModifiedDates");
    if (storedDates) {
      currentDates = JSON.parse(storedDates);
    }
    await fetchDatabaseRealtimeUpdate();
    await fetchDatabaseLastUpdated(currentDates);

    setInterval(async () => {
      console.log("Fetching realtime updates...");
      await fetchDatabaseRealtimeUpdate();
    }, 10 * 1000);
    setInterval(async () => {
      console.log("Fetching db updates...");
      await fetchDatabaseLastUpdated(currentDates);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;
    initializeData();
  }, []);

  return (
    <IonPage>
      <div className="downloadFilesContainer">
        <img src={icon} alt="icon" />
        {/* <div className="download-image-wrapper">
          <LoadingImage />
        </div> */}
        <h1>{downloadHint}</h1>
        {downloadError === true && (
          <IonButton
            onClick={async () => {
              try {
                await store.create();
                await store.clear();
                navigator.serviceWorker
                  .getRegistrations()
                  .then((registrations) => {
                    for (const registration of registrations) {
                      registration.unregister();
                    }
                  });
              } catch (error) {
                console.error(error);
              } finally {
                window.location.reload();
              }
            }}
          >
            {t("reset_app")}
          </IonButton>
        )}
      </div>
    </IonPage>
  );
};

export default DownloadFiles;
