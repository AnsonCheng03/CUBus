import { IonIcon, IonModal } from "@ionic/react";
import { navigateCircleOutline } from "ionicons/icons";
import { Component } from "react";
import { withTranslation } from "react-i18next";
import { getLocation } from "../Functions/getLocation";
import { LoadingImage } from "./newPageModal";
import React from "react";

import { LuLocateFixed } from "react-icons/lu";

interface gpsSelectIconProps {
  appData: any;
  t: any;
  setDest?: any;
  fullName?: boolean;
}

interface gpsSelectBoxProps {
  openModal: boolean;
  closeModal: any;
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
      openModal: false,
      sortedGPSData: [],
    };
  }

  setItemState = (key: string, value: any) => {
    this.setState((prevState: any) => ({ ...prevState, [key]: value }));
  };

  render() {
    const { appData, t, setDest } = this.props;

    const changeValuebyGPS = (locCode: string) => {
      if (setDest) setDest(locCode);
    };

    return (
      <>
        <div class="gpsIcon">
          <LuLocateFixed
            className="image-wrapper"
            id="Dest-GPS-box"
            onClick={async () => {
              await getLocation(
                t,
                appData.GPS,
                (value: any) => {
                  this.setItemState("sortedGPSData", value);
                },
                (value: boolean) => {
                  this.setItemState("openModal", value);
                  this.forceUpdate();
                }
              );
            }}
          />
        </div>
        <GPSSelectBox
          openModal={(this.state as any).openModal}
          closeModal={() => {
            this.setItemState("openModal", false);
          }}
          sortedGPSData={(this.state as any).sortedGPSData}
          setSortedGPSData={(value: any, closeModal?: boolean) => {
            this.setItemState("sortedGPSData", value);
          }}
          changeValuebyGPS={changeValuebyGPS}
          fullName={this.props.fullName}
        />
      </>
    );
  }
}

class PopUpBox extends Component<gpsSelectBoxProps> {
  modalRef: React.RefObject<HTMLIonModalElement>;

  constructor(props: gpsSelectBoxProps) {
    super(props);

    this.modalRef = React.createRef<HTMLIonModalElement>();
  }

  render() {
    const {
      openModal,
      closeModal,
      sortedGPSData,
      setSortedGPSData,
      changeValuebyGPS,
      fullName,
      t,
    } = this.props;

    const dismissModal = () => {
      closeModal();
      setSortedGPSData([]);
    };

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
            onClick={async () => {
              !data[1].error &&
                changeValuebyGPS(
                  fullName
                    ? `${formattedGPSText(data[0])} (${data[0]})`
                    : data[0]
                );
              await this.modalRef.current?.dismiss();
            }}
          >
            <div className="GpsText">{formattedGPSText(data[0])}</div>
            {!data[1].error && (
              <div className="gpsMeter">
                {Number(data[1].distance.toFixed(3)) * 1000 > 1000
                  ? "> 9999"
                  : Number(data[1].distance.toFixed(3)) * 1000 + " m"}
              </div>
            )}
          </div>
        );
      });
    };

    return (
      <IonModal
        isOpen={openModal}
        id={"GPSModal"}
        canDismiss={sortedGPSData && sortedGPSData.length > 0}
        onDidDismiss={dismissModal}
        ref={this.modalRef}
        mode="ios"
      >
        {sortedGPSData && sortedGPSData.length > 0 ? (
          <div className="GPSModalDetails">
            <div className="showdetails">
              <h4 id="details-box-heading">{t("nearst_txt")}</h4>
              <div
                className="map-submit-btn"
                onClick={() => {
                  this.modalRef.current?.dismiss();
                }}
              >
                {t("cancel_btntxt")}
              </div>
            </div>
            <div id="GPSresult">{returnNearest(sortedGPSData)}</div>
          </div>
        ) : (
          <div className="loading-image-wrapper">
            <LoadingImage />
          </div>
        )}
      </IonModal>
    );
  }
}

export const GPSSelectBox = withTranslation("global")(PopUpBox);
export const GPSSelectIcon = withTranslation("global")(SelectIcon);
