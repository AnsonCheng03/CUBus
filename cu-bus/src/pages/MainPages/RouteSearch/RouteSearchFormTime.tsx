import { useRef, useCallback, useState } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import busMapImage from "../../assets/schoolbusmap.svg";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  IonPopover,
  IonToolbar,
} from "@ionic/react";
import { t } from "i18next";
import { timeOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { RouteSelect } from "../../Components/selectRouteForm";

const locationTimeChooser = ({
  generateRouteResult,
  departNow,
  setDepartNow,
  selectWeekday,
  setSelectWeekday,
  selectDate,
  setSelectDate,
  selectHour,
  setSelectHour,
  selectMinute,
  setSelectMinute,
  TravelDateOptions,
}: any) => {
  const [t, i18n] = useTranslation("global");
  const [modalOpen, setOpenModal] = useState(false);
  return (
    <div className="locationChooserContainer">
      <div className="timeChooser">
        <label htmlFor="Dest" id="Time-label">
          <IonIcon icon={timeOutline}></IonIcon>
        </label>

        <div className="locationinput">
          <div className="departTime" id="departTimePopover">
            {departNow
              ? t("info-deptnow")
              : `${t(selectWeekday)} ${
                  selectWeekday === "WK-Sun" ? "" : t(selectDate)
                } ${selectHour}:${selectMinute}`}
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
              <IonItem
                button={true}
                detail={false}
                onClick={() => {
                  setDepartNow(true);
                  generateRouteResult();
                }}
              >
                現在出發
              </IonItem>
              <IonItem
                button={true}
                detail={false}
                onClick={() => {
                  setDepartNow(false);
                  setOpenModal(true);
                }}
              >
                {t("select-depart-time")}
              </IonItem>
            </IonList>
          </IonContent>
        </IonPopover>
      </div>
      <TimeSelectorModal
        generateRouteResult={generateRouteResult}
        isOpen={modalOpen}
        setIsOpen={setOpenModal}
        selectWeekday={selectWeekday}
        setSelectWeekday={setSelectWeekday}
        selectDate={selectDate}
        setSelectDate={setSelectDate}
        selectHour={selectHour}
        setSelectHour={setSelectHour}
        selectMinute={selectMinute}
        setSelectMinute={setSelectMinute}
        TravelDateOptions={TravelDateOptions}
      />
    </div>
  );
};

const TimeSelectorModal = ({
  generateRouteResult,
  isOpen,
  setIsOpen,
  selectWeekday,
  setSelectWeekday,
  selectDate,
  setSelectDate,
  selectHour,
  setSelectHour,
  selectMinute,
  setSelectMinute,
  TravelDateOptions,
}: any) => {
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal
      ref={modal}
      isOpen={isOpen}
      canDismiss={async (data?: any, role?: string) =>
        new Promise<boolean>((resolve, reject) => {
          resolve(role === "confirm");
        })
      }
      onDidDismiss={(e) => {
        setIsOpen(false);
        generateRouteResult();
      }}
      id="timeSelectorModal"
    >
      <IonToolbar>
        <IonButtons slot="end">
          <IonButton onClick={() => modal.current!.dismiss("", "confirm")}>
            Done
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <div>
        <div id="time-schedule">
          <div className="time-schedule">
            <RouteSelect
              selectValue={selectWeekday}
              setSelectValue={setSelectWeekday}
              elementClass="select-Weekday"
              onChange={(e: any) => {
                if (e.target.value === "WK-Sun") {
                  setSelectDate("HD");
                }
              }}
              options={[
                "WK-Sun",
                "WK-Mon",
                "WK-Tue",
                "WK-Wed",
                "WK-Thu",
                "WK-Fri",
                "WK-Sat",
              ]}
              translateValue
            />
            {selectWeekday === "WK-Sun" ? null : (
              <RouteSelect
                selectValue={selectDate}
                setSelectValue={setSelectDate}
                elementClass="select-date"
                options={TravelDateOptions}
                translateValue
              />
            )}
            <RouteSelect
              selectValue={selectHour}
              setSelectValue={setSelectHour}
              elementClass="select-time"
              options={Array.from({ length: 24 }, (_, i) =>
                i.toString().padStart(2, "0")
              )}
            />
            :
            <RouteSelect
              selectValue={selectMinute}
              setSelectValue={setSelectMinute}
              elementClass="select-time"
              options={Array.from({ length: 12 }, (_, i) =>
                (i * 5).toString().padStart(2, "0")
              )}
            />
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default locationTimeChooser;
