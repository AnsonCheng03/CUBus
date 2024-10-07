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

    function canDismiss() {
      return new Promise<boolean>((resolve, reject) => {
        resolve(true);
        setRouteMap([]);
      });
    }
    // return  ? (
    //     <div
    //       id="close-button"
    //       onClick={() => {
    //
    //       }}
    //     >
    //       &times;
    //     </div>

    //   </div>
    // ) : null;

    return (
      <IonModal
        initialBreakpoint={0.5}
        isOpen={routeMap && routeMap.length > 0}
        canDismiss={canDismiss}
        breakpoints={[0, 0.5]}
        handleBehavior="cycle"
        id={"RouteModal"}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Modal</IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() => {
                  setRouteMap([]);
                }}
              >
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
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
