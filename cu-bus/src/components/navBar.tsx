import "./navBar.css";

import { createAnimation, IonIcon, IonItem } from "@ionic/react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  homeOutline,
  searchOutline,
  informationOutline,
  settingsOutline,
} from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation("global");
  const location = useLocation();

  const navItem = (
    icon: string,
    text: string,
    link: string,
    home?: boolean
  ) => {
    return (
      <li>
        <IonItem
          routerLink={link}
          routerDirection="forward"
          detail={false}
          // routerAnimation={createAnimation().duration(1000).addAnimation()}
        >
          <div
            className={`navLink
               ${
                 (home && location.pathname === "/") ||
                 location.pathname === link
                   ? "active"
                   : ""
               }`}
          >
            <IonIcon icon={icon} />
            <p className="navtext">{text}</p>
          </div>
        </IonItem>
      </li>
    );
  };

  const metaTags = () => {
    const title = (() => {
      const infotitle = t("web_info_title") ?? "中大校巴資訊站 CU BUS INFOPAGE";
      switch (location.pathname) {
        case "/realtime":
          return `${t("title_realtime")} | ${infotitle}`;
        case "/route":
          return `${t("title_routesearch")} | ${infotitle}`;
        case "/settings":
          return `${t("title_settings")} | ${infotitle}`;
        case "/info":
          return `${t("title_info")} | ${infotitle}`;
        default:
          return infotitle;
      }
    })();

    const description = (() => {
      switch (location.pathname) {
        case "/realtime":
          return t("meta_desc_realtime");
        case "/route":
          return t("meta_desc_routesearch");
        default:
          return "中大校巴資訊站 CU BUS INFOPAGE";
      }
    })();

    return (
      <Helmet>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta http-equiv="Content-Language" content={i18n.language} />
      </Helmet>
    );
  };

  return (
    <nav>
      <h1>{t("WEB-Title")}</h1>
      {metaTags()}
      <div className="navFunctions">
        <ul>
          {navItem(homeOutline, t("NAV-Home"), "/realtime", true)}
          {navItem(searchOutline, t("NAV-StationSearch"), "/route")}
          {navItem(informationOutline, t("NAV-Info"), "/info")}
          {navItem(settingsOutline, t("NAV-Settings"), "/settings")}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
