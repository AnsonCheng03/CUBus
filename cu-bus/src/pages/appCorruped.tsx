import { IonButton, IonPage } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";

import "./appCorruped.css";

import { Storage } from "@ionic/storage";

const store = new Storage();

const AppCorrupted: React.FC<{}> = () => {
  const { t } = useTranslation("preset");

  return (
    <IonPage>
      <p className="appCorruptedText">{t("app_data_corrupted")}</p>
      <IonButton
        onClick={async () => {
          await store.create();
          await store.clear();
          window.location.reload();
        }}
      >
        {t("reset_app")}
      </IonButton>
    </IonPage>
  );
};

export default AppCorrupted;
