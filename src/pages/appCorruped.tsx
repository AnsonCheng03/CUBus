import { IonButton, IonPage } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";

import "./appCorruped.css";

import { Storage } from "@ionic/storage";

const store = new Storage();

const AppCorrupted: React.FC<{
  missingData: string[];
}> = ({ missingData }) => {
  const { t } = useTranslation("preset");

  return (
    <IonPage>
      <div className="downloadFilesContainer">
        <p className="appCorruptedText">{t("app_data_corrupted")}</p>
        <span className="appCorruptedNote">{missingData.join(", ")}</span>
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
      </div>
    </IonPage>
  );
};

export default AppCorrupted;
