import "./mobilePWAPrompt.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPlatforms } from "@ionic/react";
import appIcon from "../assets/bus.ico";

const MobilePWAPrompt: React.FC = () => {
  if (
    getPlatforms().includes("mobile") &&
    !getPlatforms().includes("mobileweb")
  ) {
    return null;
  }

  const { t } = useTranslation("global");
  const [showPrompt, setShowPrompt] = useState(false);
  let installPrompt: any;

  const compareTime = () => {
    if (localStorage.getItem("dismissHomeScreen") == null) return false;
    const savedTime = localStorage.getItem("dismissHomeScreen");
    if (savedTime === null) return false;
    const dismissTime = Date.parse(savedTime),
      currentTime = new Date();
    currentTime.setHours(currentTime.getHours() - 24);
    return dismissTime - currentTime.getTime() > 0;
  };

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false);
    } else if (!compareTime()) {
      if (getPlatforms().includes("mobileweb")) {
        setShowPrompt(true);
      } else {
        window.addEventListener("beforeinstallprompt", (ev) => {
          ev.preventDefault();
          setShowPrompt(true);
          installPrompt = ev;
        });
      }
    }
  }, []);

  return (
    <>
      {showPrompt &&
        (getPlatforms().includes("ios") ? (
          <div id="HomeScreenPrompt">
            <div className="desc">
              <p>
                <b>{t("addhomeios-heading")}</b>
              </p>

              <button
                onClick={() => {
                  setShowPrompt(false);
                  localStorage.setItem(
                    "dismissHomeScreen",
                    new Date().toISOString()
                  );
                }}
              >
                <a>{t("cancel_btntxt")}</a>
              </button>
            </div>
            <div className="dsecimg">
              <div>
                <svg viewBox="0 0 120 169">
                  <g fill="currentColor">
                    <path d="M60 0l28 28-2 2a586 586 0 0 0-4 4L64 15v90h-8V15L38 34l-4-4-2-2L60 0z"></path>
                    <path d="M0 49h44v8H8v104h104V57H76v-8h44v120H0V49z"></path>
                  </g>
                </svg>
                <p>{t("addhomeios-text1")}</p>
              </div>
              <div className="dsecimg2">
                <svg viewBox="55.99425507 31.98999977 157.76574707 157.76371765">
                  <path
                    fill="#d4a373"
                    d="M90.49 32.83a54.6 54.6 0 019.55-.84c23.98.03 47.96 0 71.94.01 8.5.07 17.3 1.74 24.4 6.65 10.94 7.28 16.52 20.54 17.35 33.3.06 26.03 0 52.06.03 78.08 0 10.16-3.59 20.56-10.95 27.73-7.93 7.61-18.94 11.43-29.79 11.98-25.71.03-51.42 0-77.12.01-10.37-.11-21.01-3.77-28.17-11.48-8.22-8.9-11.72-21.29-11.73-33.21.01-23.03-.03-46.05.02-69.07-.01-9.14 1.33-18.71 6.65-26.4 6.21-9.4 16.97-14.79 27.82-16.76m38.18 41.09c-.05 10.25.01 20.5 0 30.75-9.58-.03-19.16.02-28.75-.04-2.27.08-4.98-.25-6.68 1.61-2.84 2.34-2.75 7.12.01 9.48 1.8 1.69 4.46 1.57 6.75 1.64 9.56-.04 19.12-.01 28.67-.03.02 10.24-.06 20.48.01 30.72-.14 2.66 1.36 5.4 3.95 6.3 3.66 1.66 8.52-1.13 8.61-5.23.26-10.59.02-21.2.09-31.79 9.88 0 19.76.02 29.64.01 2.74.12 5.85-.67 7.14-3.34 2.23-3.75-.61-9.34-5.08-9.29-10.57-.14-21.14-.01-31.7-.04-.01-10.25.04-20.49 0-30.74.3-3.5-2.66-7.09-6.3-6.79-3.65-.33-6.66 3.26-6.36 6.78z"
                  ></path>
                  <path
                    fill="transparent"
                    d="M128.67 73.92c-.3-3.52 2.71-7.11 6.36-6.78 3.64-.3 6.6 3.29 6.3 6.79.04 10.25-.01 20.49 0 30.74 10.56.03 21.13-.1 31.7.04 4.47-.05 7.31 5.54 5.08 9.29-1.29 2.67-4.4 3.46-7.14 3.34-9.88.01-19.76-.01-29.64-.01-.07 10.59.17 21.2-.09 31.79-.09 4.1-4.95 6.89-8.61 5.23-2.59-.9-4.09-3.64-3.95-6.3-.07-10.24.01-20.48-.01-30.72-9.55.02-19.11-.01-28.67.03-2.29-.07-4.95.05-6.75-1.64-2.76-2.36-2.85-7.14-.01-9.48 1.7-1.86 4.41-1.53 6.68-1.61 9.59.06 19.17.01 28.75.04.01-10.25-.05-20.5 0-30.75z"
                  ></path>
                </svg>
                <p>{t("addhomeios-text2")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div id="AndroidHomeScreenPrompt">
            <div className="desc">
              <img alt="App Icon" src={appIcon} width="50px" />
              <p>
                <b>CU BUS WEB</b>
              </p>
            </div>
            <div className="btns">
              <button
                className="Addtohomebtn"
                onClick={() => {
                  setShowPrompt(false);
                  try {
                    installPrompt.prompt();
                  } catch (e) {
                    window.alert("Failed to prompt installation");
                  }
                }}
              >
                <a>{t("addhomeapp-heading")}</a>
              </button>
              <button
                className="Canceltohomebtn"
                onClick={() => {
                  setShowPrompt(false);
                  localStorage.setItem(
                    "dismissHomeScreen",
                    new Date().toISOString()
                  );
                }}
              >
                <a>{t("cancel_btntxt")}</a>
              </button>
            </div>
          </div>
        ))}
    </>
  );
};

export default MobilePWAPrompt;
