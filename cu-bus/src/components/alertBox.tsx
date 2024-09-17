import "./alertBox.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPlatforms } from "@ionic/react";
import appIcon from "../assets/bus.ico";

const AlertBox: React.FC<{ notice: any }> = ({ notice }) => {
  const { i18n } = useTranslation("global");

  const alert = (type: string, content: string) => {
    return (
      <div className={`alert-box ${type}`}>
        <p>{content}</p>
      </div>
    );
  };

  return (
    <div className="alert-wrapper">
      <div className="alert-container">
        {notice &&
          notice.reverse().map((noti: any) => {
            return alert(
              noti.pref.type,
              noti.content[i18n.language === "zh" ? 0 : 1]
            );
          })}
      </div>
    </div>
  );

  //   echo "
  //   <script>
  //     const alertContainer = document.querySelector('.alert-container');
  //     let alertIndex = 0;
  //     let alertTimeout;
  //     const alerts = document.querySelectorAll('.alert-box');
  //     const alertWrapper = document.querySelector('.alert-wrapper');
  //     console.log(alerts);
  //     function nextAlert() {
  //       alertIndex++;
  //       if (alertIndex >= alerts.length) alertIndex = 0;
  //       alertContainer.style.transform = 'translateX(-' + alertIndex + '00vw)';
  //       clearTimeout(alertTimeout);
  //       alertTimeout = setTimeout(nextAlert, 5000);
  //     }
  //     alertTimeout = setTimeout(nextAlert, 5000);
  //     alertContainer.addEventListener('click', nextAlert);
  //   </script>
  //   ";
  // }
};

export default AlertBox;
