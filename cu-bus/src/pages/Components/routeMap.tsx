import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from "@ionic/react";
import React, { Component } from "react";

interface routeMapProps {
  routeMap: any;
  setRouteMap: any;
}

export default class RouteMap extends Component<routeMapProps> {
  render() {
    const { routeMap, setRouteMap } = this.props;

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
              {routeMap[0] &&
                routeMap[0].map((station: string, index: number) => {
                  return (
                    <div
                      className={
                        "station-container-wrapper" +
                        (index < routeMap[1] ? " completed" : "")
                      }
                      key={station + index}
                    >
                      <div className="station-container">
                        <div className="station-number">{index + 1}</div>
                        <div className="station-name">{station}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </IonContent>
      </IonModal>
    );
  }
}
