import "./navBar.css";

import { IonIcon, IonItem } from "@ionic/react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  homeOutline,
  searchOutline,
  informationOutline,
  settingsOutline,
} from "ionicons/icons";
import { useLocation } from "react-router-dom";

const NavBar: React.FC = () => {
  const { t } = useTranslation("global");

  const location = useLocation();

  useEffect(() => {
    console.log("Current URL:", location.pathname);
  }, [location]);

  return (
    <nav>
      <h1>{t("WEB-Title")}</h1>
      <div className="navFunctions">
        <ul>
          <li>
            <IonItem
              routerLink="/realtime"
              routerDirection="none"
              detail={false}
            >
              <div
                className={`navLink ${
                  location.pathname === "/realtime" ? "active" : ""
                }`}
              >
                <IonIcon icon={homeOutline} />
                <p className="navtext">{t("NAV-Home")}</p>
              </div>
            </IonItem>
          </li>
          <li>
            <IonItem routerLink="/route" routerDirection="none" detail={false}>
              <div
                className={`navLink ${
                  location.pathname === "/route" ? "active" : ""
                }`}
              >
                <IonIcon icon={searchOutline} />
                <p className="navtext">{t("NAV-StationSearch")}</p>
              </div>
            </IonItem>
          </li>
          <li>
            <IonItem routerLink="/info" routerDirection="none" detail={false}>
              <div
                className={`navLink ${
                  location.pathname === "/info" ? "active" : ""
                }`}
              >
                <IonIcon icon={informationOutline} />
                <p className="navtext">{t("NAV-Info")}</p>
              </div>
            </IonItem>
          </li>
          <li>
            <IonItem
              routerLink="/settings"
              routerDirection="none"
              detail={false}
            >
              <div
                className={`navLink ${
                  location.pathname === "/settings" ? "active" : ""
                }`}
              >
                <IonIcon icon={settingsOutline} />
                <p className="navtext">{t("NAV-Settings")}</p>
              </div>
            </IonItem>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
