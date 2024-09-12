import { IonPage } from "@ionic/react";
import "./Info.css";
import { useTranslation } from "react-i18next";

const Info: React.FC<{ appData: any }> = ({ appData }) => {
  const [t, i18n] = useTranslation("global");
  const lang = i18n.language === "zh" ? 1 : 0;

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
        {appData.WebsiteLinks.map((row: any) => {
          if (row[0][lang]) {
            return (
              <div className="option" key={row[0][lang]}>
                <a target="_blank" className="websites" href={row[1]}>
                  {row[0][lang]}
                </a>
              </div>
            );
          }
        })}
        <div
          className="option expandable"
          onClick={(e) => expand(e.currentTarget)}
        >
          <div>{t("privacy_page")}</div>
          <div className="option-expand">
            <div className="option-expand-wrapper">
              <div className="option-expand-content">
                本網站會在您每次造訪時記錄訪客數量和基本使用模式。部分此類資訊及您的個人化數據將通過Cookie收集。Cookie是一種小型資訊檔案，會自動儲存在訪客電腦的瀏覽器中，並可被本網站讀取。每當用戶訪問本網站時，伺服器日誌檔案會自動辨識並記錄訪客的IP地址、造訪日期和時間，以及瀏覽的總頁數。您的網路服務供應商會自動為您的電腦或其他電子設備分配IP地址。在互聯網上，收集IP地址是一種普遍做法，許多網站都會自動執行。IP地址將用於多種用途，包括監測網站流量、診斷伺服器問題、為您提供更個人化的線上和離線體驗、管理網站和/或提高合規性和安全水平。此資訊僅保留七天。本網頁會儲存大部分用戶輸入的資料，如目的地、提交時間等，但用戶IP地址等可識別身份的資料不會與輸入資料連結，因此無法直接通過用戶輸入的資料辨識其身份。這些資料將用於調整巴士班次和服務時間等用途，詳情可查閱網站原始碼。用戶的所有資料都不會被出售。與CUSIS服務相關的網頁不會被列入資料收集範圍，用戶在這些頁面的所有資料都不會被儲存。本網頁使用多家公司的服務進行廣告投放和數據分析，相關公司包括Google
                Analytics、Skimlinks、Cloudflare和PropellerAds，詳細資訊請參閱各機構的隱私聲明。網站的隱私聲明會不定期更新，為確保您了解最新版本的內容，請經常查看本網頁。
                <br />
                <br />
                This website records visitor numbers and basic usage patterns
                every time you visit. Some of this information and your
                personalized data are collected through cookies. A cookie is a
                small information file that is automatically stored in the
                visitor's browser on their computer and can be read by this
                website. Whenever a user accesses this website, the server log
                file automatically identifies and records the visitor's IP
                address, visit date and time, and the total number of pages
                viewed. Your internet service provider automatically assigns an
                IP address to your computer or other electronic device.
                Collecting IP addresses is a common practice on the internet,
                and many websites do this automatically. IP addresses are used
                for various purposes, including monitoring website traffic,
                diagnosing server issues, providing you with a more personalized
                online and offline experience, managing the website, and/or
                improving compliance and security levels. This information is
                retained for only seven days. This webpage stores most of the
                data input by users, such as destination and submission time,
                but personally identifiable information like user IP addresses
                is not linked to the input data, so users cannot be directly
                identified by their input. This data will be used for purposes
                such as adjusting bus schedules and service times, with details
                available in the website's source code. None of the user's data
                will be sold. Web pages related to CUSIS services are not
                included in the data collection scope, and all user data on
                these pages will not be stored. This webpage uses services from
                multiple companies for advertising and data analysis, including
                Google Analytics, Skimlinks, Cloudflare, and PropellerAds. For
                detailed information, please refer to the privacy statements of
                each organization. The website's privacy statement is updated
                periodically. To ensure you are familiar with the latest version
                of the content, please check this webpage frequently.
              </div>
            </div>
          </div>
        </div>
        <div
          className="option expandable"
          onClick={(e) => expand(e.currentTarget)}
        >
          <div>{t("about_page")}</div>
          <div className="option-expand">
            <div className="option-expand-wrapper">
              <div className="option-expand-content">
                中大校巴資訊站是由香港中文大學(中大)本校學生精心打造的網上平台。這個中大校巴資訊站旨在解決中大學生在校園內交通方面的諸多困擾。由於中文大學校方並未提供足夠的校巴資訊,導致中大學生經常難以準確得知校巴何時到站。同時,中大校園廣闊,校巴路線繁多複雜,尤其對於剛入學的中大新生來說,要迅速找到自己需要乘搭的校巴路線往往是一大挑戰。
                為了徹底解決這些問題,中大校巴資訊站應運而生。這個專為中大學生設計的校巴資訊平台提供了一系列實用的功能:
                <ul>
                  <li>
                    點對點校巴路線搜尋:中大學生可以輕鬆查找從一個中大校園地點到另一個地點的最佳校巴路線。
                  </li>
                  <li>
                    實時中大校巴查詢服務:讓中大學生隨時掌握校巴的即時位置和到站時間。
                  </li>
                  <li>
                    中大學生實時報告校巴位置:鼓勵中大學生互助,共同更新校巴實時資訊。
                  </li>
                  <li>
                    靈活選擇中大建築物作起點/終點:方便中大學生規劃校園內的行程。
                  </li>
                  <li>
                    同時搜尋上行和下行校巴站:全面覆蓋中大校巴的所有可能路線。
                  </li>
                  <li>
                    提供中大校巴轉車方案:幫助中大學生在複雜路線中找到最優解。
                  </li>
                  <li>智能篩選服務時間外之校巴:避免中大學生查到無效資訊。</li>
                  <li>預覽功能:中大學生可提前查看未來某日的校巴路線安排。</li>
                  <li>
                    無需下載即可使用:中大校巴資訊站設計成網頁版,方便快捷。
                  </li>
                  <li>
                    離線地圖功能:即使在網絡不穩定的情況下,中大學生仍可查看校園地圖。
                  </li>
                  <li>
                    可添加至主畫面:讓中大學生像使用App一樣方便地訪問校巴資訊。
                  </li>
                </ul>
                這些精心設計的功能使得中大校巴資訊站成為了中大學生在校園內穿梭的得力助手。無論是往返中大各學院、宿舍,還是探索中大校園的不同角落,中大校巴資訊站都能為中大學生提供最及時、最準確的校巴資訊。通過使用中大校巴資訊站,中大學生可以更有效地規劃自己的校園行程,省去等待校巴的煩惱,充分利用寶貴的學習時間。
              </div>
            </div>
          </div>
        </div>
        ;
      </div>
    </IonPage>
  );
};

export default Info;
