import {
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  IonList,
  IonItem,
  IonButtons,
  IonAvatar,
  IonImg,
  IonSearchbar,
  IonLoading,
} from "@ionic/react";
import loadingImage from "../../assets/download.gif";
import { key, navigateCircleOutline } from "ionicons/icons";
import React, { Component, createRef, useRef, useState } from "react";
import { withTranslation } from "react-i18next";
import { getLocation } from "../Functions/getLocation";
import { GPSData } from "../Functions/getRealTime";

interface gpsSelectIconProps {
  appData: any;
  t: any;
  setDest?: any;
  fullName?: boolean;
}

interface gpsSelectBoxProps {
  sortedGPSData: any;
  setSortedGPSData: any;
  t: any;
  changeValuebyGPS: any;
  fullName?: boolean;
}

class SelectIcon extends Component<gpsSelectIconProps> {
  constructor(props: gpsSelectIconProps) {
    super(props);
    this.state = {
      sortedGPSData: [],
      loadingState: false,
    };
  }

  setItemState = (key: string, value: any) => {
    this.setState((prevState: any) => {
      return { ...prevState, [key]: value };
    });
  };

  render() {
    const { appData, t, setDest } = this.props;

    const changeValuebyGPS = (locCode: string) => {
      if (setDest) setDest(locCode);
      this.setItemState("sortedGPSData", []);
    };

    return (
      <>
        <IonIcon
          icon={navigateCircleOutline}
          className="image-wrapper"
          id="Dest-GPS-box"
          onClick={() => {
            this.setState({ loadingState: true });
            getLocation(
              t,
              appData.GPS,
              (value: any) => {
                this.setItemState("sortedGPSData", value);
              },
              (value: any) => {
                this.setItemState("loadingState", value);
              }
            );
          }}
        />
        <GPSSelectBox
          sortedGPSData={(this.state as any).sortedGPSData}
          // setSortedGPSData={this.setSortedGPSData}
          setSortedGPSData={(value: any) => {
            this.setItemState("sortedGPSData", value);
          }}
          changeValuebyGPS={changeValuebyGPS}
          fullName={this.props.fullName}
        />
        <Loading isOpen={(this.state as any).loadingState === true} />
      </>
    );
  }
}

class Loading extends Component<{ isOpen: boolean }> {
  render() {
    return (
      <IonModal
        isOpen={this.props.isOpen}
        canDismiss={!this.props.isOpen}
        id={"LoadingModal"}
      >
        <img src={loadingImage} alt="loading" />
      </IonModal>
    );
  }
}

class PopUpBox extends Component<gpsSelectBoxProps> {
  render() {
    const { sortedGPSData, setSortedGPSData, changeValuebyGPS, fullName, t } =
      this.props;

    function canDismiss() {
      return new Promise<boolean>((resolve, reject) => {
        resolve(true);
        setSortedGPSData([]);
      });
    }

    const formattedGPSText = (string: any) => {
      return string.includes("|")
        ? t(string.split("|")[0]) + " (" + t(string.split("|")[1]) + ")"
        : t(string);
    };

    const returnNearest = (sortedGPSData: any) => {
      return sortedGPSData.slice(0, 5).map((data: any) => {
        return (
          <div
            className="gpsOptions"
            key={data[0]}
            onClick={() => {
              changeValuebyGPS(
                fullName ? `${formattedGPSText(data[0])} (${data[0]})` : data[0]
              );
            }}
          >
            <div className="GpsText">{formattedGPSText(data[0])}</div>
            <div className="gpsMeter">
              {Number(data[1].distance.toFixed(3)) * 1000 > 1000
                ? "> 9999"
                : Number(data[1].distance.toFixed(3)) * 1000 + " m"}
            </div>
          </div>
        );
      });
    };

    return (
      <IonModal
        isOpen={sortedGPSData && sortedGPSData.length > 0}
        canDismiss={canDismiss}
        id={"GPSModal"}
      >
        <IonContent className="ion-padding">
          <div className="showdetails">
            <h4 id="details-box-heading">{t("nearst_txt")}</h4>
            <div
              className="map-submit-btn"
              onClick={() => setSortedGPSData([])}
            >
              {t("cancel_btntxt")}
            </div>
          </div>
          <div id="GPSresult">{returnNearest(sortedGPSData)}</div>
        </IonContent>
      </IonModal>
    );
  }
}

export const GPSSelectBox = withTranslation("global")(PopUpBox);
export const GPSSelectIcon = withTranslation("global")(SelectIcon);
