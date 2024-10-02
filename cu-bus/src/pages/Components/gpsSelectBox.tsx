import { IonIcon } from "@ionic/react";
import { navigateCircleOutline } from "ionicons/icons";
import React, { Component, useState } from "react";
import { withTranslation } from "react-i18next";
import { getLocation } from "../Functions/getLocation";
import { GPSData } from "../Functions/generalRoute";

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
    };
  }

  setSortedGPSData = (data: GPSData) => {
    this.setState({ sortedGPSData: data });
  };

  render() {
    const { appData, t, setDest } = this.props;

    const changeValuebyGPS = (locCode: string) => {
      if (setDest) setDest(locCode);
      sessionStorage.setItem("realtime-Dest", locCode);
      this.setSortedGPSData([]);
    };

    return (
      <>
        <IonIcon
          icon={navigateCircleOutline}
          className="image-wrapper"
          id="Dest-GPS-box"
          onClick={() => {
            getLocation("Dest-GPS-box", t, this.setSortedGPSData, appData.GPS);
          }}
        ></IonIcon>
        <GPSSelectBox
          sortedGPSData={(this.state as any).sortedGPSData}
          setSortedGPSData={this.setSortedGPSData}
          changeValuebyGPS={changeValuebyGPS}
          fullName={this.props.fullName}
        />
      </>
    );
  }
}

class PopUpBox extends Component<gpsSelectBoxProps> {
  render() {
    const { sortedGPSData, setSortedGPSData, changeValuebyGPS, fullName, t } =
      this.props;

    return sortedGPSData && sortedGPSData.length > 0 ? (
      <div id="details-box">
        <div className="details-box">
          <div className="showdetails">
            <h4 id="details-box-heading">{t("nearst_txt")}</h4>
            <div
              className="map-submit-btn"
              onClick={() => setSortedGPSData([])}
            >
              {t("cancel_btntxt")}
            </div>
          </div>
          <div id="GPSresult">
            {sortedGPSData.slice(0, 3).map((data: any) => {
              return (
                <div
                  className="gpsOptions"
                  key={data[0]}
                  onClick={() => {
                    changeValuebyGPS(
                      fullName ? `${t(data[0])} (${data[0]})` : data[0]
                    );
                  }}
                >
                  <div className="GpsText">
                    {data[0].includes("|")
                      ? t(data[0].split("|")[0]) +
                        " (" +
                        t(data[0].split("|")[1]) +
                        ")"
                      : t(data[0])}
                  </div>
                  <div className="gpsMeter">
                    {Number(data[1].distance.toFixed(3)) * 1000 > 1000
                      ? "> 9999"
                      : Number(data[1].distance.toFixed(3)) * 1000 + " m"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ) : null;
  }
}

export const GPSSelectBox = withTranslation("global")(PopUpBox);
export const GPSSelectIcon = withTranslation("global")(SelectIcon);
