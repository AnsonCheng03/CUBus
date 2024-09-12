import React, { useEffect, useState } from "react";
import { IonPage } from "@ionic/react";
import axios from "axios";
import "./DownloadFiles.css";

import { useTranslation } from "react-i18next";

import icon from "../assets/bus.jpg";

import { Storage } from "@ionic/storage";
const store = new Storage();
store.create(); // Initialize the storage

interface DownloadFilesProps {
  setDownloadedState: (isDownloaded: boolean) => void;
  i18next: any;
  appData: any;
  setAppData: any;
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
}) => {
  const { t } = useTranslation("preset");

  const [downloadHint, setDownloadHint] = useState<string>(
    t("DownloadFiles-Initializing")
  );

  useEffect(() => {
    const compareModificationDates = (
      localDates: ModificationDates | null,
      serverDates: ModificationDates
    ): boolean => {
      if (!localDates) return true;

      for (const table in serverDates) {
        if (
          serverDates[table] &&
          (!localDates[table] || localDates[table] < serverDates[table])
        ) {
          return true;
        }
      }
      return false;
    };

    const fetchDatabaseLastUpdated = async (
      currentDates: ModificationDates | null
    ) => {
      try {
        setDownloadHint(t("DownloadFiles-Downloading"));
        const response = await axios.get<ModificationDates>(
          "http://localhost:8000/Essential/functions/getClientData.php"
        );
        const serverDates = response.data;

        // Fetch and process all data, regardless of update status
        await fetchData(currentDates, serverDates);

        setDownloadHint(t("DownloadFiles-Complete"));
        setDownloadedState(true);
      } catch (error) {
        setDownloadHint(t("DownloadFiles-Error"));
        store.clear();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    const fetchData = async (
      currentDates: ModificationDates | null,
      serverDates: ModificationDates
    ) => {
      try {
        setDownloadHint(t("DownloadFiles-Processing"));

        const response = await axios.post<ServerResponse>(
          "http://localhost:8000/Essential/functions/getClientData.php",
          currentDates
        );

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
          if (response.data[table]) {
            // Data was downloaded
            tableData = response.data[table];
            await store.set(`data-${table}`, JSON.stringify(tableData));
          } else {
            // Data wasn't downloaded, fetch from local storage
            tableData = JSON.parse(await store.get(`data-${table}`));
          }

          // Process and store the data
          if (tableData) {
            await processTableData(table, tableData);
          }
        }

        // Update local storage with new modification dates
        if (response.data.modificationDates) {
          await store.set(
            "lastModifiedDates",
            JSON.stringify(response.data.modificationDates)
          );
        }

        setDownloadHint(t("StoreFile-Complete"));
      } catch (error) {
        setDownloadHint(t("StoreFile-Error"));
        console.error(error);
        store.clear();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
        case "station":
        case "notice":
          setAppData((prev: any) => {
            return { ...prev, [table]: data };
          });
          break;
        default:
          console.log(`Unknown table: ${table}`);
      }
    };

    const initializeData = async () => {
      await store.create();
      let currentDates: ModificationDates | null = null;
      const storedDates = await store.get("lastModifiedDates");
      if (storedDates) {
        currentDates = JSON.parse(storedDates);
      }
      await fetchDatabaseLastUpdated(currentDates);
    };

    initializeData();
  }, []);

  return (
    <IonPage>
      <div className="downloadFilesContainer">
        <img src={icon} alt="icon" />
        <h1>{downloadHint}</h1>
      </div>
    </IonPage>
  );
};

export default DownloadFiles;
