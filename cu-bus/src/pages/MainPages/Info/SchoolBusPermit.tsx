import {
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonRouterLink,
  IonSegment,
  IonSegmentButton,
  useIonModal,
} from "@ionic/react";
import "./SchoolBusPermit.css";
import { useTranslation } from "react-i18next";
import { OverlayEventDetail } from "@ionic/core/components";
import { useEffect, useRef, useState } from "react";
import ModalInput from "../../Components/newPageModal";
import BusMap from "../../AddonPages/routeMap";
import Settings from "../Settings/Settings";
import domtoimage from "dom-to-image";
import { t } from "i18next";

import d_bus_img from "../../../assets/schbus_d.png";
import l_bus_img from "../../../assets/schbus_l.png";
import cuhk_logo from "../../../assets/cuhk_logo.png";

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

  return (
    <IonContent>
      <div className="busPermitInputModalDesc">
        <IonNote color="medium"> {schoolBusPermitDesc}</IonNote>
      </div>

      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_Name")}
          labelPlacement="stacked"
          ref={busPermitNameRef}
          type="text"
          value={appSettings.schoolBusPermit.name}
        />
      </IonItem>
      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_SID")}
          labelPlacement="stacked"
          ref={busPermitSIDRef}
          type="number"
          value={appSettings.schoolBusPermit.sid}
        />
      </IonItem>
      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_Major")}
          labelPlacement="stacked"
          ref={busPermitMajorRef}
          type="text"
          value={appSettings.schoolBusPermit.major}
        />
      </IonItem>
      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_Exp")}
          labelPlacement="stacked"
          ref={busPermitExpRef}
          type="text"
          value={appSettings.schoolBusPermit.expiry}
        />
      </IonItem>
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
    </IonContent>
  );
};

const SchoolBusPermitCard: React.FC<{
  permit: any;
  busMode: string;
}> = ({ permit, busMode }) => {
  const [t] = useTranslation("global");

  type BusRoutes = {
    meet_class_bus: { [key: string]: string };
    shuttle_bus: { [key: string]: string };
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const cardImgRef = useRef<HTMLDivElement>(null);

  const busRoutes: BusRoutes = {
    meet_class_bus: {
      5: "linear-gradient(90deg, #c2d6ea 0%, #29a1d8 100%)",
      "6A": "linear-gradient(90deg, #7c8644 0%, #585823 100%)",
      "6B": "linear-gradient(90deg, #4f88c1 0%, #3f438f 100%)",
      7: "linear-gradient(90deg, #c2c2c2 0%, #666666 100%)",
    },
    shuttle_bus: {
      1: "linear-gradient(90deg, #fff149 0%, #f3b53a 100%)",
      2: "linear-gradient(90deg, #fff149 0%, #f3b53a 100%)",
      3: "linear-gradient(90deg, #a4cc39 0%, #318761 100%)",
      4: "linear-gradient(90deg, #f1a63b 0%, #e75a24 100%)",
      8: "linear-gradient(90deg, #ffe3a8 0%, #ffc55A 100%)",
      N: "linear-gradient(90deg, #d1b4d5 0%, #7961a8 100%)",
      H: "linear-gradient(90deg, #896391 0%, #453087 100%)",
    },
  };

  useEffect(() => {
    domtoimage
      .toSvg(cardRef.current as Node, {
        width: 560 * 2,
        height: 356 * 2,
        quality: 1,
      })
      .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        if (cardImgRef.current?.firstChild) {
          cardImgRef.current?.removeChild(cardImgRef.current?.firstChild);
        }
        cardImgRef.current?.appendChild(img);
      })
      .catch(function (error) {
        console.error("oops, something went wrong!", error);
      });
  }, [permit, busMode]);

  return (
    <div className="cardsContainer">
      <div className="cardImg">
        <div className="busCardImg" ref={cardImgRef} />
      </div>
      <div className="originalCard">
        <div className="card" ref={cardRef}>
          <div className="busimg">
            <img
              src={busMode === "meet_class_bus" ? l_bus_img : d_bus_img}
              alt="bus"
            />
          </div>
          <div className="details">
            <div className="header">
              <div className="logo">
                <img src={cuhk_logo} alt="CUHK" />
              </div>
              <div className="schname">
                <span>香港中文大學</span>
                <span> The Chinese University of Hong Kong</span>
              </div>
              <div className="hinttxt">
                <span>落車前請按鐘一次</span>
                <span>To Stop Press The Bell Once</span>
              </div>
            </div>
            <div className="cardname">
              <h1>
                {busMode === "meet_class_bus" ? "轉堂校巴證" : "穿梭校巴證"}
              </h1>
              <h2>
                {busMode === "meet_class_bus"
                  ? "Meet-Class Bus Permit"
                  : "Shuttle Bus Permit"}
              </h2>
            </div>
            <div className="routeavil">
              <div className="desctxt">
                <span>持證者獲交通事務處批准乘搭下列的穿梭校巴路線</span>
                <span>
                  The Permit Holder is allowed to ride on the following routes
                </span>
              </div>
              <div className="routes">
                {Object.keys(busRoutes[busMode as keyof BusRoutes]).map(
                  (route) => (
                    <span
                      className={busMode}
                      key={route}
                      style={{ background: busRoutes[busMode][route] }}
                    >
                      {route}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="studatas">
              <div className="Name">
                <div className="desc">
                  <span>學生姓名</span>
                  <span>Name</span>
                </div>
                <div className="value">
                  <span>{permit.name}</span>
                </div>
              </div>
              <div className="SID">
                <div className="desc">
                  <span>學生編號</span>
                  <span>Student ID</span>
                </div>
                <div className="value">
                  <span>{permit.sid}</span>
                </div>
              </div>
              <div className="Major">
                <div className="desc">
                  <span>主修科目</span>
                  <span>Major</span>
                </div>
                <div className="value">
                  <span>{permit.major}</span>
                </div>
              </div>
              <div className="Valid">
                <div className="desc">
                  <span>有效期至</span>
                  <span>Valid Until</span>
                </div>
                <div className="value">
                  <span>{permit.expiry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

  const [busMode, setBusMode] = useState<keyof BusRoutes>("shuttle_bus");
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <IonContent
      onClick={() => {
        if (fullScreen === true) setFullScreen(false);
      }}
    >
      {fullScreen === false && (
        <IonSegment
          value={busMode}
          onIonChange={(e: CustomEvent) => {
            setBusMode(e.detail.value as keyof BusRoutes);
          }}
        >
          <IonSegmentButton value="shuttle_bus">
            <IonLabel> {t("shuttle_bus")}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="meet_class_bus">
            <IonLabel>{t("meet_class_bus")}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      )}
      <SchoolBusPermitCard permit={permit} busMode={busMode} />
      {fullScreen === false && (
        <IonButtons className="ion-padding showPermitButtons">
          <IonButton
            onClick={() => {
              setFullScreen(true);
            }}
          >
            {t("Permit_FullScreen")}
          </IonButton>
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
      )}
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
