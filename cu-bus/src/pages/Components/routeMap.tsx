import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from "@ionic/react";
import React, { Component, useEffect } from "react";

interface routeMapProps {
  routeMap: any;
  setRouteMap: any;
}

export default class RouteMap extends Component<routeMapProps> {
  render() {
    const { routeMap, setRouteMap } = this.props;

    const currentStation = React.createRef<HTMLDivElement>();

    function canDismiss(data?: any, role?: string) {
      if (role === "gesture") return Promise.resolve(false);
      return new Promise<boolean>((resolve, reject) => {
        resolve(true);
        setRouteMap([]);
      });
    }

    return (
      <IonModal
        initialBreakpoint={0.5}
        isOpen={routeMap && routeMap.length > 0}
        canDismiss={canDismiss}
        onDidPresent={() => {
          if (currentStation.current) {
            currentStation.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }}
        id={"RouteModal"}
      >
        <IonContent
          className="ion-padding"
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
        >
          <div id="detail-route-container">
            <div id="map-container">
              <div className="map-container">
                {routeMap[0] &&
                  routeMap[0].map((station: string, index: number) => {
                    return (
                      <div
                        className={
                          "station-container-wrapper" +
                          (index < routeMap[1] ? " completed" : "") +
                          (index == routeMap[1] ? " current" : "")
                        }
                        key={station + index}
                        {...(routeMap[1] === index + 1
                          ? {
                              ref: currentStation,
                            }
                          : {})}
                      >
                        <div className="station-container">
                          <div className="station-number">{}</div>
                          <div className="station-name">{station}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </IonContent>
      </IonModal>
    );
  }
}
