import { IonPage } from "@ionic/react";
import "./Settings.css";
import { useTranslation } from "react-i18next";

import { Storage } from "@ionic/storage";
const store = new Storage();
store.create(); // Initialize the storage

const Settings: React.FC<{}> = () => {
  const [t, i18n] = useTranslation("global");

  function expand(element: HTMLElement) {
    if (
      element.querySelector(".option-expand")?.classList.contains("expanded")
    ) {
      element.querySelector(".option-expand")?.classList.remove("expanded");
    } else {
      element.querySelector(".option-expand")?.classList.toggle("expanded");
    }
  }
  return (
    <IonPage>
      <div className="option-list">
        <div
          className="option"
          onClick={() => {
            i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
            window.location.reload();
          }}
        >
          <div>{i18n.language === "zh" ? "Change Language" : "轉換語言"}</div>
        </div>

        <div
          className="option"
          onClick={async () => {
            await store.create();
            await store.clear();
            window.location.reload();
          }}
        >
          <div>{t("Delete-Storage")}</div>
        </div>

        {/* <div
          className="option"
          onClick={() => window.open("https://payme.hsbc/anson03")}
        >
          <div>{t("Support-btn")}</div>
        </div> */}

        <div
          className="option"
          onClick={() => window.open("https://github.com/AnsonCheng03")}
        >
          <div>{t("About-btn")}</div>
        </div>

        <div
          className="option"
          onClick={() => window.open("https://github.com/AnsonCheng03")}
        >
          <div>{t("Designer-Abt-btn")}</div>
        </div>
      </div>
    </IonPage>
  );
};

export default Settings;
