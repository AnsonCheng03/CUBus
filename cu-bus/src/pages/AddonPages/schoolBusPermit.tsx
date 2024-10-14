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
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import domtoimage from "dom-to-image";
import { OverlayEventDetail } from "@ionic/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type BusRoutes = {
  meet_class_bus: { [key: string]: string };
  shuttle_bus: { [key: string]: string };
};

const SchoolBusPermitInputModal = ({
  Permit,
  showInputModal,
  setShowInputModal,
  setShowShowModal,
  setPermit,
}: any) => {
  const [t] = useTranslation("global");
  const [presentAlert] = useIonAlert();

  const modal = useRef<HTMLIonModalElement>(null);
  const inputName = useRef<HTMLIonInputElement>(null);
  const inputSID = useRef<HTMLIonInputElement>(null);
  const inputMajor = useRef<HTMLIonInputElement>(null);
  const inputExpiry = useRef<HTMLIonInputElement>(null);

  function confirm() {
    if (
      !inputName.current?.value ||
      !inputSID.current?.value ||
      !inputMajor.current?.value ||
      !inputExpiry.current?.value
    ) {
      presentAlert({
        header: t("School_Bus_Permit_Error_No_Input"),
        buttons: ["OK"],
      });
      return;
    }

    setPermit({
      name: inputName.current?.value,
      sid: inputSID.current?.value,
      major: inputMajor.current?.value,
      expiry: inputExpiry.current?.value,
    });

    setShowShowModal(true);

    modal.current?.dismiss(
      {
        name: inputName.current?.value,
        sid: inputSID.current?.value,
        major: inputMajor.current?.value,
        expiry: inputExpiry.current?.value,
      },
      "confirm"
    );
  }

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === "confirm") {
      console.log("confirmed", ev.detail.data);
    }
  }

  function onDidDismiss(ev: CustomEvent<OverlayEventDetail>) {
    setShowInputModal(false);
  }

  return (
    <IonModal
      ref={modal}
      isOpen={showInputModal}
      onWillDismiss={onWillDismiss}
      onDidDismiss={onDidDismiss}
      id="schoolBusPermitInputModal"
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={() => confirm()}>
              Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <div className="busPermitInputModalDesc">
        <IonNote color="medium"> {t("School_Bus_Permit_Desc")}</IonNote>
      </div>

      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_Name")}
          labelPlacement="stacked"
          ref={inputName}
          type="text"
          value={Permit.name}
        />
      </IonItem>
      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_SID")}
          labelPlacement="stacked"
          ref={inputSID}
          type="text"
          value={Permit.sid}
        />
      </IonItem>
      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_Major")}
          labelPlacement="stacked"
          ref={inputMajor}
          type="text"
          value={Permit.major}
        />
      </IonItem>
      <IonItem>
        <IonInput
          label={t("School_Bus_Permit_Exp")}
          labelPlacement="stacked"
          ref={inputExpiry}
          type="text"
          value={Permit.expiry}
        />
      </IonItem>
    </IonModal>
  );
};

const SchoolBusPermitCard = ({
  permit,
  busMode,
}: {
  permit: any;
  busMode: keyof BusRoutes;
}) => {
  const [t] = useTranslation("global");

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
        width: 560,
        height: 356,
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
      <div className="cardImg" ref={cardImgRef} />
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
                {Object.keys(busRoutes[busMode]).map((route) => (
                  <span
                    className={busMode}
                    style={{ background: busRoutes[busMode][route] }}
                  >
                    {route}
                  </span>
                ))}
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

const SchoolBusPermitShowModal = ({
  permit,
  setShowInputModal,
  showShowModal,
  setShowShowModal,
}: any) => {
  const [t] = useTranslation("global");

  const [busMode, setBusMode] = useState<keyof BusRoutes>("meet_class_bus");
  const [fullScreen, setFullScreen] = useState(false);

  const modal = useRef<HTMLIonModalElement>(null);

  const onDidDismiss = () => {
    setShowShowModal(false);
  };

  return (
    <IonModal
      ref={modal}
      isOpen={showShowModal}
      onDidDismiss={onDidDismiss}
      id="schoolBusPermitShowModal"
      mode="ios"
      canDismiss={(data?: any, role?: string) => {
        if (fullScreen === true) setFullScreen(false);
        if (role === "backdrop") return Promise.resolve(false);
        return new Promise<boolean>((resolve, reject) => {
          resolve(true);
        });
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
            {t("School_Bus_Permit_FullScreen")}
          </IonButton>
          <IonButton
            onClick={() => {
              modal.current?.dismiss();
              setShowInputModal(true);
            }}
          >
            {t("School_Bus_Permit_Edit")}
          </IonButton>
          <IonButton
            onClick={() => {
              modal.current?.dismiss();
            }}
          >
            {t("School_Bus_Permit_Close")}
          </IonButton>
        </IonButtons>
      )}
    </IonModal>
  );
};

const SchoolBusPermit = () => {
  const [t] = useTranslation("global");

  const [permit, setPermit] = useState<{
    name: string | null;
    sid: string | null;
    major: string | null;
    expiry: string | null;
  }>({
    name: null,
    sid: null,
    major: null,
    expiry: null,
  });
  const [showInputModal, setShowInputModal] = useState(false);
  const [showShowModal, setShowShowModal] = useState(false);

  return (
    <>
      <IonList inset={true}>
        <IonItem
          onClick={() => {
            if (permit.name === null) {
              setShowInputModal(true);
            } else {
              setShowShowModal(true);
            }
          }}
        >
          <IonLabel>{t("school_bus_permit_title")}</IonLabel>
        </IonItem>
      </IonList>
      <SchoolBusPermitInputModal
        Permit={permit}
        showInputModal={showInputModal}
        setShowInputModal={setShowInputModal}
        setShowShowModal={setShowShowModal}
        setPermit={setPermit}
      />
      <SchoolBusPermitShowModal
        permit={permit}
        setShowInputModal={setShowInputModal}
        showShowModal={showShowModal}
        setShowShowModal={setShowShowModal}
      />
    </>
  );
};

export default SchoolBusPermit;
