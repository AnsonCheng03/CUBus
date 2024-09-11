import React, { useEffect, useState } from "react";
import { IonPage } from "@ionic/react";
import axios from "axios";
import "./DownloadFiles.css";

interface DownloadFilesProps {
  setDownloadedState: (isDownloaded: boolean) => void;
}

interface Translations {
  en: { [key: string]: string };
  zh: { [key: string]: string };
}

const DownloadFiles: React.FC<DownloadFilesProps> = ({
  setDownloadedState,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [downloadHint, setDownloadHint] = useState<string>("Downloading");

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setDownloadHint("Downloading Translations");
        const response = await axios.get<Translations>(
          "http://localhost:8000/Essential/functions/getTranslation.php"
        );
        setTranslations(response.data);
        setDownloadHint("Downloaded Translations");
        setDownloadedState(true);
      } catch (error) {
        setDownloadHint("Error fetching translations");
      }
    };

    fetchTranslations();
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
