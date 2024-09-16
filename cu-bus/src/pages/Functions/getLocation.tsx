import { TFunction } from "i18next";
import { Geolocation } from "@capacitor/geolocation";

interface GPSPoint {
  Lat: string;
  Lng: string;
  distance?: number;
}

interface GPSData {
  [key: string]: GPSPoint;
}

function distanceBetweenTwoPlace(
  firstLat: number,
  firstLon: number,
  secondLat: number,
  secondLon: number,
  unit: string
) {
  var firstRadlat = (Math.PI * firstLat) / 180;
  var secondRadlat = (Math.PI * secondLat) / 180;
  var theta = firstLon - secondLon;
  var radtheta = (Math.PI * theta) / 180;
  var distance =
    Math.sin(firstRadlat) * Math.sin(secondRadlat) +
    Math.cos(firstRadlat) * Math.cos(secondRadlat) * Math.cos(radtheta);
  if (distance > 1) {
    distance = 1;
  }
  distance = Math.acos(distance);
  distance = (distance * 180) / Math.PI;
  distance = distance * 60 * 1.1515;
  if (unit == "K") {
    distance = distance * 1.609344;
  }
  if (unit == "N") {
    distance = distance * 0.8684;
  }
  return distance;
}

export function getLocation(
  item: any,
  t: TFunction,
  setSortedGPSData: React.Dispatch<React.SetStateAction<any>>,
  gpsData: any
) {
  // globalThis.item = item;
  function showPosition(position: GeolocationPosition) {
    let updatedGPSData: GPSData = { ...gpsData };

    for (const key in updatedGPSData) {
      updatedGPSData[key].distance = distanceBetweenTwoPlace(
        position.coords.latitude,
        position.coords.longitude,
        parseFloat(updatedGPSData[key].Lat),
        parseFloat(updatedGPSData[key].Lng),
        "K"
      );
    }

    const sortedGPSData = Object.entries(updatedGPSData).sort(
      (a, b) => (a[1].distance || 0) - (b[1].distance || 0)
    );

    if ((sortedGPSData[0][1].distance || 0) > 0.5) {
      setSortedGPSData([]);

      window.alert(t("nearst_error"));
    } else {
      setSortedGPSData(sortedGPSData);
      console.log(sortedGPSData[0]);
    }
  }

  function Positionfailed() {
    window.alert(t("GPS-error"));
    setSortedGPSData([]);
  }

  Geolocation.getCurrentPosition()
    .then((position) => {
      showPosition(position as GeolocationPosition);
    })
    .catch((error) => {
      window.alert(t("GPS-error"));
      Positionfailed();
    });
}
