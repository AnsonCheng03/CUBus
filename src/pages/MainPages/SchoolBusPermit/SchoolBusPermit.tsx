import {
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonNote,
  IonPage,
} from "@ionic/react";
import "./SchoolBusPermit.css";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";

import { Storage } from "@ionic/storage";
const store = new Storage();
store.create(); // Initialize the storage

import SchoolBusPermitCard from "./SchoolBusPermitCard";

const SchoolBusPermitInput: React.FC<{
  appSettings: any;
  setAppSettings: any;
  permit: any;
  setPermit: any;
}> = ({ appSettings, setAppSettings, permit, setPermit }) => {
  const [t, i18n] = useTranslation("global");
  const schoolBusPermitDesc =
    i18n.language === "zh"
      ? "本網站所展示的校巴證僅為創作作品，旨在提供趣味性及娛樂用途，並非由香港中文大學或其任何相關部門授權、認可或發行的正式證件。根據現行規定，乘搭校巴需出示學生證或其他有效證件（校巴證不在此列）。本校巴證不具任何實際功能，亦不可作為身份識別或其他用途。如有疑問，請聯絡香港中文大學官方機構查詢。"
      : "The bus pass provided on this website is a creative work intended solely for entertainment purposes and is not an official document issued, endorsed, or authorized by The Chinese University of Hong Kong or any of its affiliated departments. According to current regulations, students are required to present a student ID or other valid identification (excluding the bus pass) when boarding the university shuttle buses. This bus pass holds no official function and should not be used for identification or any other purposes. For any inquiries, please contact the official representatives of The Chinese University of Hong Kong.";

  const busPermitNameRef = useRef<HTMLIonInputElement>(null);
  const busPermitSIDRef = useRef<HTMLIonInputElement>(null);
  const busPermitMajorRef = useRef<HTMLIonInputElement>(null);
  const busPermitExpRef = useRef<HTMLIonInputElement>(null);

  const permitInput = (
    label: string,
    ref: React.RefObject<HTMLIonInputElement>,
    type: "text" | "number",
    value: string
  ) => {
    return (
      <IonItem>
        <IonInput
          label={label}
          labelPlacement="stacked"
          ref={ref}
          type={type}
          {...(type === "number" ? { inputmode: "numeric" } : {})}
          value={value}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log("Enter pressed");
              Keyboard.hide();
            }
          }}
        />
      </IonItem>
    );
  };

  return (
    <div className="busPermitInputContent">
      <div className="busPermitInputModalDesc">
        <IonNote color="medium"> {schoolBusPermitDesc}</IonNote>
      </div>
      {permitInput(
        t("School_Bus_Permit_Name"),
        busPermitNameRef,
        "text",
        appSettings.schoolBusPermit?.name ?? ""
      )}
      {permitInput(
        t("School_Bus_Permit_SID"),
        busPermitSIDRef,
        "number",
        appSettings.schoolBusPermit?.sid ?? ""
      )}
      {permitInput(
        t("School_Bus_Permit_Major"),
        busPermitMajorRef,
        "text",
        appSettings.schoolBusPermit?.major ?? ""
      )}
      {permitInput(
        t("School_Bus_Permit_Exp"),
        busPermitExpRef,
        "text",
        appSettings.schoolBusPermit?.expiry ?? ""
      )}
      <IonButtons className="ion-padding showPermitButtons">
        <IonButton
          onClick={() => {
            const permit = {
              name: busPermitNameRef.current?.value,
              sid: busPermitSIDRef.current?.value,
              major: busPermitMajorRef.current?.value,
              expiry: busPermitExpRef.current?.value,
            };
            setAppSettings({ ...appSettings, schoolBusPermit: permit });
            setPermit(permit);
          }}
        >
          {t("Permit_Save")}
        </IonButton>
      </IonButtons>
    </div>
  );
};

const SchoolBusPermitDisplay: React.FC<{
  permit: any;
  setPermit: any;
}> = ({ permit, setPermit }) => {
  const [t] = useTranslation("global");

  type BusRoutes = {
    meet_class_bus: { [key: string]: string };
    shuttle_bus: { [key: string]: string };
  };

  return (
    <IonContent>
      <SchoolBusPermitCard permit={permit} busMode={"shuttle_bus"} />
      <SchoolBusPermitCard permit={permit} busMode={"meet_class_bus"} />
      <IonButtons className="ion-padding showPermitButtons">
        <IonButton
          onClick={() => {
            setPermit({
              name: null,
              sid: null,
              major: null,
              expiry: null,
            });
          }}
        >
          {t("Permit_Edit")}
        </IonButton>
      </IonButtons>
    </IonContent>
  );
};

const SchoolBusPermit: React.FC<{
  appSettings: any;
  setAppSettings: any;
}> = ({ appSettings, setAppSettings }) => {
  const [permit, setPermit] = useState(
    appSettings.schoolBusPermit ?? {
      name: null,
      sid: null,
      major: null,
      expiry: null,
    }
  );

  useEffect(() => {
    console.log("Saving appSettings to storage:", appSettings);
    store.set("appSettings", appSettings);
  }, [appSettings]);

  useEffect(() => {
    Keyboard.setAccessoryBarVisible({ isVisible: true });

    return () => {
      Keyboard.setAccessoryBarVisible({ isVisible: false });
    };
  }, []);

  return (
    <IonPage className="pageSafeArea">
      {permit && permit.name === null ? (
        <SchoolBusPermitInput
          appSettings={appSettings}
          setAppSettings={setAppSettings}
          permit={permit}
          setPermit={setPermit}
        />
      ) : (
        <SchoolBusPermitDisplay permit={permit} setPermit={setPermit} />
      )}
    </IonPage>
  );
};

export default SchoolBusPermit;
