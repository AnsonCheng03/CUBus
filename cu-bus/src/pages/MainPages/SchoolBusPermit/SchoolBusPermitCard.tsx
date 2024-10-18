import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import domtoimage from "dom-to-image";

import d_bus_img from "../../../assets/schbus_d.png";
import l_bus_img from "../../../assets/schbus_l.png";
import cuhk_logo from "../../../assets/cuhk_logo.png";
import { LoadingImage } from "../../Components/newPageModal";
import { IonModal } from "@ionic/react";

const SchoolBusPermitCard: React.FC<{
  permit: any;
  busMode: string;
}> = ({ permit, busMode }) => {
  const [t] = useTranslation("global");

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  type BusRoutes = {
    meet_class_bus: { [key: string]: string };
    shuttle_bus: { [key: string]: string };
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardImgRef = useRef<HTMLDivElement>(null);
  const modalContent = useRef<HTMLDivElement>(null);

  const busRoutes: BusRoutes = {
    meet_class_bus: {
      5: "linear-gradient(90deg, #c2d6ea 0%, #29a1d8 100%)",
      "6A": "linear-gradient(90deg, #7c8644 0%, #585823 100%)",
      "6B": "linear-gradient(90deg, #4f88c1 0%, #3f438f 100%)",
      7: "linear-gradient(90deg, #c2c2c2 0%, #666666 100%)",
    },
    shuttle_bus: {
      1: "linear-gradient(90deg, #fff149 0%, #f3b53a 100%)",
      2: "linear-gradient(90deg, #fff149 0%, #f3b53a 100%)",
      3: "linear-gradient(90deg, #a4cc39 0%, #318761 100%)",
      4: "linear-gradient(90deg, #f1a63b 0%, #e75a24 100%)",
      8: "linear-gradient(90deg, #ffe3a8 0%, #ffc55A 100%)",
      N: "linear-gradient(90deg, #d1b4d5 0%, #7961a8 100%)",
      H: "linear-gradient(90deg, #896391 0%, #453087 100%)",
    },
  };

  useEffect(() => {
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(void 0);
      }, 1000);
    }).then(() =>
      domtoimage
        .toSvg(cardRef.current as Node, {
          width: 560 * 2,
          height: 356 * 2,
          quality: 1,
        })
        .then(function (dataUrl) {
          setLoading(false);
          var img = new Image();
          img.src = dataUrl;
          if (cardImgRef.current?.firstChild) {
            cardImgRef.current?.removeChild(cardImgRef.current?.firstChild);
          }
          cardImgRef.current?.appendChild(img);
          // cardRef.current?.parentElement?.remove();
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        })
    );
  }, [permit, busMode]);

  return (
    <>
      <IonModal
        id="schoolBusPermitShowModal"
        isOpen={modalOpen}
        onClick={() => {
          setModalOpen(false);
        }}
        onWillPresent={() => {
          const cardContent = cardContainerRef.current?.cloneNode(true);
          const modalContentElement = modalContent.current;
          const loadImageToModal = (
            modalContentElement: HTMLElement,
            cardContent: Node
          ) => {
            if (modalContentElement.firstChild) {
              modalContentElement.removeChild(modalContentElement.firstChild);
            }
            modalContentElement.appendChild(cardContent);
          };
          if (cardContent && modalContentElement) {
            loadImageToModal(modalContentElement, cardContent);
          } else {
            setTimeout(() => {
              if (cardContent && modalContentElement) {
                loadImageToModal(modalContentElement, cardContent);
              } else {
                setModalOpen(false);
              }
            }, 500);
          }
        }}
        onDidDismiss={() => setModalOpen(false)}
      >
        <div ref={modalContent} className="cardModal" />
      </IonModal>
      <div
        className="cardsContainer"
        ref={cardContainerRef}
        onClick={() => {
          if (loading) return;
          setModalOpen(true);
        }}
      >
        <div className="cardImg">
          <div className="busCardImg" ref={cardImgRef} />
          {loading ? (
            <LoadingImage />
          ) : (
            <div className="busimg">
              <img
                src={busMode === "meet_class_bus" ? l_bus_img : d_bus_img}
                alt="bus"
              />
            </div>
          )}
        </div>
        <div className="originalCard">
          <div className="card" ref={cardRef}>
            <div className="details">
              <div className="header">
                <div className="logo">
                  <img src={cuhk_logo} alt="CUHK" />
                </div>
                <div className="schname">
                  <span>香港中文大學</span>
                  <span> The Chinese University of Hong Kong</span>
                </div>
                <div className="hinttxt">
                  <span>落車前請按鐘一次</span>
                  <span>To Stop Press The Bell Once</span>
                </div>
              </div>
              <div className="cardname">
                <h1>
                  {busMode === "meet_class_bus" ? "轉堂校巴證" : "穿梭校巴證"}
                </h1>
                <h2>
                  {busMode === "meet_class_bus"
                    ? "Meet-Class Bus Permit"
                    : "Shuttle Bus Permit"}
                </h2>
              </div>
              <div className="routeavil">
                <div className="desctxt">
                  <span>持證者獲交通事務處批准乘搭下列的穿梭校巴路線</span>
                  <span>
                    The Permit Holder is allowed to ride on the following routes
                  </span>
                </div>
                <div className="routes">
                  {Object.keys(busRoutes[busMode as keyof BusRoutes]).map(
                    (route) => (
                      <span
                        className={busMode}
                        key={route}
                        style={{ background: busRoutes[busMode][route] }}
                      >
                        {route}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="studatas">
                <div className="Name">
                  <div className="desc">
                    <span>學生姓名</span>
                    <span>Name</span>
                  </div>
                  <div className="value">
                    <span>{permit.name}</span>
                  </div>
                </div>
                <div className="SID">
                  <div className="desc">
                    <span>學生編號</span>
                    <span>Student ID</span>
                  </div>
                  <div className="value">
                    <span>{permit.sid}</span>
                  </div>
                </div>
                <div className="Major">
                  <div className="desc">
                    <span>主修科目</span>
                    <span>Major</span>
                  </div>
                  <div className="value">
                    <span>{permit.major}</span>
                  </div>
                </div>
                <div className="Valid">
                  <div className="desc">
                    <span>有效期至</span>
                    <span>Valid Until</span>
                  </div>
                  <div className="value">
                    <span>{permit.expiry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchoolBusPermitCard;
