import React, { useEffect, useState } from "react";
import { IonPage } from "@ionic/react";
import axios from "axios";
import "./DownloadFiles.css";

import { Storage } from "@ionic/storage";
const store = new Storage();

interface DownloadFilesProps {
  setDownloadedState: (isDownloaded: boolean) => void;
  i18next: any;
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
}) => {
  const [downloadHint, setDownloadHint] = useState<string>("Loading");

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
        setDownloadHint("Checking for updates");
        const response = await axios.get<ModificationDates>(
          "http://localhost:8000/Essential/functions/getClientData.php"
        );
        const serverDates = response.data;

        // Fetch and process all data, regardless of update status
        await fetchData(currentDates, serverDates);

        setDownloadHint("Data processing completed");
        setDownloadedState(true);
      } catch (error) {
        setDownloadHint("Error checking for updates");
        console.error(error);
      }
    };

    const fetchData = async (
      currentDates: ModificationDates | null,
      serverDates: ModificationDates
    ) => {
      try {
        setDownloadHint("Processing data");

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
            // tableData = await store.get(`data-${table}`);
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

        setDownloadHint("Data processed and stored");
      } catch (error) {
        setDownloadHint("Error processing data");
        console.error(error);
      }
    };

    const processTableData = async (table: string, data: any) => {
      switch (table) {
        case "translation":
          i18next.addResourceBundle("en", "global", data.en);
          i18next.addResourceBundle("zh", "global", data.zh);
          break;
        case "bus":
        case "station":
        case "notice":
        case "GPS":
        case "WebsiteLinks":
          console.log(`Table ${table} not yet implemented`);
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
      <div className="container">
        <h1>{downloadHint}</h1>
      </div>
    </IonPage>
  );
};

export default DownloadFiles;
