import { useRef, useCallback } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import busMapImage from "../../assets/schoolbusmap.svg";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
} from "@ionic/react";
import { t } from "i18next";
import { timeOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";

const locationTimeChooser = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <div className="locationChooserContainer">
      <div className="timeChooser">
        <label htmlFor="Dest" id="Time-label">
          <IonIcon icon={timeOutline}></IonIcon>
        </label>

        <div className="locationinput">
          <div className="departTime" id="departTimePopover">
            {t("info-deptnow")}
          </div>
        </div>

        <IonPopover
          trigger="departTimePopover"
          dismissOnSelect={true}
          mode="ios"
          side="end"
        >
          <IonContent>
            <IonList>
              <IonItem button={true} detail={false}>
                現在出發
              </IonItem>
              <IonItem button={true} detail={false}>
                {t("select-depart-time")}
              </IonItem>
            </IonList>
          </IonContent>
        </IonPopover>

        {/* <div className="bus-options">
                <span className="slider-wrapper">
                  <div className="slider-container">
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="deptnow"
                        name="deptnow"
                        checked={departNow}
                        onChange={(e) => {
                          const timeSchedule =
                            document.getElementById("time-schedule");

                          if (e.target.checked) {
                            if (timeSchedule)
                              timeSchedule.style.display = "none";
                          } else {
                            if (timeSchedule)
                              timeSchedule.style.display = "block";
                          }

                          setDepartNow(e.target.checked);
                        }}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </span>
              </div> */}
      </div>
    </div>
  );
};

export default locationTimeChooser;
