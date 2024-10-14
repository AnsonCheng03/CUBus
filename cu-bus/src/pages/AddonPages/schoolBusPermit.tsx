import "./schoolBusPermit.css";

import d_bus_img from "./schbus_d.png";
import l_bus_img from "./schbus_l.png";
import cuhk_logo from "./CUHK.png";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const schoolBusPermit = () => {
  const [t] = useTranslation("global");

  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const [message, setMessage] = useState(
    "This modal example uses triggers to automatically open a modal when the button is clicked."
  );

  function confirm() {
    modal.current?.dismiss(input.current?.value, "confirm");
  }

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === "confirm") {
      setMessage(`Hello, ${ev.detail.data}!`);
    }
  }

  useEffect(() => {
    modal.current?.present();
  }, []);

  return (
    <IonPage>
      <IonModal ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>Welcome</IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={() => confirm()}>
                Confirm
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {t("School_Bus_Permit_Description")}
          <IonItem>
            <IonInput
              label={t("School_Bus_Permit_Name")}
              labelPlacement="stacked"
              ref={input}
              type="text"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={t("School_Bus_Permit_SID")}
              labelPlacement="stacked"
              ref={input}
              type="text"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={t("School_Bus_Permit_Major")}
              labelPlacement="stacked"
              ref={input}
              type="text"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={t("School_Bus_Permit_Expiry")}
              labelPlacement="stacked"
              ref={input}
              type="text"
            />
          </IonItem>
        </IonContent>
      </IonModal>
      <canvas id="canvas" width="560" height="356"></canvas>
    </IonPage>
  );
};

export default schoolBusPermit;
