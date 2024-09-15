import "./navBar.css";

import { IonIcon, IonItem } from "@ionic/react";
import React from "react";
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

  const navItem = (icon: string, text: string, link: string) => {
    return (
      <li>
        <IonItem routerLink={link} routerDirection="none" detail={false}>
          <div
            className={`navLink ${location.pathname === link ? "active" : ""}`}
          >
            <IonIcon icon={icon} />
            <p className="navtext">{text}</p>
          </div>
        </IonItem>
      </li>
    );
  };

  return (
    <nav>
      <h1>{t("WEB-Title")}</h1>
      <div className="navFunctions">
        <ul>
          {navItem(homeOutline, t("NAV-Home"), "/realtime")}
          {navItem(searchOutline, t("NAV-StationSearch"), "/route")}
          {navItem(informationOutline, t("NAV-Info"), "/info")}
          {navItem(settingsOutline, t("NAV-Settings"), "/settings")}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
