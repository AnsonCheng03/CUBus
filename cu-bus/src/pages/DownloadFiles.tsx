import { IonPage } from "@ionic/react";
import "./DownloadFiles.css";

interface DownloadFilesProps {
  setDownloadedState: (isDownloaded: boolean) => void;
}

const DownloadFiles: React.FC<DownloadFilesProps> = ({
  setDownloadedState,
}) => {
  setTimeout(() => {
    setDownloadedState(true);
  }, 3000);

  return (
    <IonPage>
      <div className="container">Downloading</div>
    </IonPage>
  );
};

export default DownloadFiles;
