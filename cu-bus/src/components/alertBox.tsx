import "./alertBox.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPlatforms, IonToast, useIonToast } from "@ionic/react";
import appIcon from "../assets/bus.ico";

const AlertToast: React.FC<{
  NoticeIndex: number;
  Index: number;
  setNoticeIndex?: any;
  content: string;
  position: "top" | "middle" | "bottom";
  type?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "success"
    | "warning"
    | "danger"
    | "light"
    | "medium"
    | "dark";
  duration?: number;
  dismissButton?: boolean;
  moreInfoButton?: () => void;
}> = ({
  NoticeIndex,
  Index,
  setNoticeIndex,
  content,
  position,
  type = "success",
  duration,
  moreInfoButton,
  dismissButton = true,
}) => {
  const { t } = useTranslation("global");

  return (
    <IonToast
      isOpen={NoticeIndex === Index}
      message={content}
      onDidDismiss={() => {
        if (setNoticeIndex) setNoticeIndex((prev: number) => prev - 1);
      }}
      position={position}
      swipeGesture={dismissButton ? "vertical" : undefined}
      color={type}
      duration={duration}
      layout="stacked"
      buttons={[
        ...(moreInfoButton
          ? [
              {
                text: t("toast_more_info"),
                role: "info",
                handler: () => {
                  moreInfoButton();
                },
              },
            ]
          : []),
        ...(dismissButton
          ? [
              {
                text: t("toast_dismiss"),
                role: "cancel",
                handler: () => {},
              },
            ]
          : []),
      ]}
    ></IonToast>
  );
};

const AlertBox: React.FC<{
  notice: any;
  networkError: boolean;
}> = ({ notice, networkError }) => {
  // instead return the first notice
  const { i18n } = useTranslation("global");
  const lang = i18n.language === "zh" ? 0 : 1;

  const showNotice =
    notice &&
    notice
      .filter((noti: any) => {
        return noti.content[lang] !== "" && noti.pref.hide !== 1;
      })
      .reverse();

  const [noticeIndex, setNoticeIndex] = useState(showNotice.length - 1);

  return (
    <>
      {showNotice
        ? showNotice.map((noti: any, index: number) => (
            <AlertToast
              key={noti.id}
              Index={index}
              NoticeIndex={noticeIndex}
              setNoticeIndex={setNoticeIndex}
              content={noti.content[lang]}
              position="top"
              type={noti.pref.type}
              dismissButton={noti.pref.dismissible}
              duration={noti.pref.duration > 0 ? noti.pref.duration : undefined}
              moreInfoButton={
                noti.pref.link !== ""
                  ? () => {
                      window.open(noti.pref.link, "_blank");
                    }
                  : undefined
              }
            />
          ))
        : null}

      <AlertToast
        Index={-1}
        NoticeIndex={networkError ? 0 : -1}
        content={
          lang === 0
            ? "網絡錯誤，無法取得實時資料，請檢查網絡連接。"
            : "Network error, realtime feature is not available. Please check your network connection."
        }
        position="bottom"
        type="warning"
        dismissButton={false}
      />
    </>
  );
};

export default AlertBox;
