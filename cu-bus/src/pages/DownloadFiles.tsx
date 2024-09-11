import React, { useEffect, useState } from "react";
import { IonPage } from "@ionic/react";
import axios from "axios";
import "./DownloadFiles.css";

import { Storage } from "@ionic/storage";
const store = new Storage();
await store.create();

interface DownloadFilesProps {
  setDownloadedState: (isDownloaded: boolean) => void;
  i18next: any;
}

interface Translations {
  en: { [key: string]: string };
  zh: { [key: string]: string };
}

interface ModificationDates {
  [key: string]: string;
}

const DownloadFiles: React.FC<DownloadFilesProps> = ({
  setDownloadedState,
  i18next,
}) => {
  const [downloadHint, setDownloadHint] = useState<string>("Loading");
  const [lastModifiedDates, setLastModifiedDates] =
    useState<ModificationDates | null>(null);

  useEffect(() => {
    const fetchDatabaseLastUpdated = async () => {
      try {
        setDownloadHint("Checking for updates");
        const response = await axios.get<ModificationDates>(
          "http://localhost:8000/Essential/functions/getClientData.php"
        );
        setLastModifiedDates(response.data);
        await fetchData();
      } catch (error) {
        setDownloadHint("Error checking for updates");
      }
    };

    const fetchData = async () => {
      try {
        setDownloadHint("Downloading data");
        const response = await axios.post(
          "http://localhost:8000/Essential/functions/getClientData.php",
          lastModifiedDates
        );

        // Process the received data
        if (response.data.translation) {
          i18next.addResourceBundle(
            "en",
            "global",
            response.data.translation.en
          );
          i18next.addResourceBundle(
            "zh",
            "global",
            response.data.translation.zh
          );
        }

        // Process other data as needed
        if (response.data.bus) {
          // Handle bus data
        }
        if (response.data.station) {
          // Handle station data
        }
        if (response.data.notice) {
          // Handle notice data
        }
        if (response.data.GPS) {
          // Handle GPS data
        }
        if (response.data.WebsiteLinks) {
          // Handle WebsiteLinks data
        }

        // Update local storage with new modification dates
        if (response.data.modificationDates) {
          setLastModifiedDates(response.data.modificationDates);
          await store.set(
            "lastModifiedDates",
            JSON.stringify(response.data.modificationDates)
          );
          console.log("storedDates", response.data);
        }

        setDownloadHint("Data downloaded and processed");
        setDownloadedState(true);
      } catch (error) {
        setDownloadHint("Error fetching data");
        console.log(error);
      }
    };

    const initializeData = async () => {
      const storedDates = await store.get("lastModifiedDates");
      console.log("storedDates", storedDates);
      if (storedDates) {
        setLastModifiedDates(JSON.parse(storedDates));
      }
      await fetchDatabaseLastUpdated();
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
