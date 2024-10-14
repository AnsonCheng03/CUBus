import "./alertBox.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPlatforms, IonToast, useIonToast } from "@ionic/react";
import appIcon from "../assets/bus.ico";

const AlertToast: React.FC<{
  NoticeIndex: number;
  Index: number;
  setNoticeIndex: any;
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
        setNoticeIndex((prev: number) => prev - 1);
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

const AlertBox: React.FC<{ notice: any }> = ({ notice }) => {
  const [noticeIndex, setNoticeIndex] = useState(notice.length - 1);
  // instead return the first notice
  console.log(notice);
  return (
    <>
      {notice
        ? notice
            .reverse()
            .map((noti: any, index: number) => (
              <AlertToast
                key={noti.id}
                Index={index}
                NoticeIndex={noticeIndex}
                setNoticeIndex={setNoticeIndex}
                content={noti.content[0]}
                position="top"
                type={noti.pref.type}
                dismissButton={true}
              />
            ))
        : null}
    </>
  );
};

export default AlertBox;
