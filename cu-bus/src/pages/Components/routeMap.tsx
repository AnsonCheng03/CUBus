import React, { Component } from "react";

interface routeMapProps {
  routeMap: any;
  setRouteMap: any;
}

export default class RouteMap extends Component<routeMapProps> {
  render() {
    const { routeMap, setRouteMap } = this.props;

    return routeMap && routeMap.length > 0 ? (
      <div id="detail-route-container">
        <div
          id="close-button"
          onClick={() => {
            setRouteMap([]);
          }}
        >
          &times;
        </div>

        <div id="map-container">
          {routeMap[0].map((station: string, index: number) => {
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
    ) : null;
  }
}
