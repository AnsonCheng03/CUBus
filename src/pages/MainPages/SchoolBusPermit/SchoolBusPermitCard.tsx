import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import domtoimage from 'dom-to-image';
import { IonModal } from '@ionic/react';

import d_bus_img from '../../../assets/schbus_d.png';
import l_bus_img from '../../../assets/schbus_l.png';
import cuhk_logo from '../../../assets/cuhk_logo.png';
import { LoadingImage } from '../../Components/newPageModal';

type Permit = {
  name: string | null;
  sid: string | null;
  major: string | null;
  expiry: string | null;
};

type BusMode = 'meet_class_bus' | 'shuttle_bus';

const busRoutes: Record<BusMode, Record<string, string>> = {
  meet_class_bus: {
    5: 'linear-gradient(90deg, #c2d6ea 0%, #29a1d8 100%)',
    '6A': 'linear-gradient(90deg, #7c8644 0%, #585823 100%)',
    '6B': 'linear-gradient(90deg, #4f88c1 0%, #3f438f 100%)',
    7: 'linear-gradient(90deg, #c2c2c2 0%, #666666 100%)',
  },
  shuttle_bus: {
    1: 'linear-gradient(90deg, #fff149 0%, #f3b53a 100%)',
    2: 'linear-gradient(90deg, #fff149 0%, #f3b53a 100%)',
    3: 'linear-gradient(90deg, #a4cc39 0%, #318761 100%)',
    4: 'linear-gradient(90deg, #f1a63b 0%, #e75a24 100%)',
    8: 'linear-gradient(90deg, #ffe3a8 0%, #ffc55A 100%)',
    N: 'linear-gradient(90deg, #d1b4d5 0%, #7961a8 100%)',
    H: 'linear-gradient(90deg, #896391 0%, #453087 100%)',
  },
};

const CARD_W = 560;
const CARD_H = 356;

const SchoolBusPermitCard: React.FC<{
  permit: Permit;
  busMode: BusMode;
}> = ({ permit, busMode }) => {
  const [t] = useTranslation('global');

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const busImgSrc = busMode === 'meet_class_bus' ? l_bus_img : d_bus_img;

  const createSnapshot = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return;
    try {
      // small delay to ensure fonts/images laid out
      await new Promise((r) => setTimeout(r, 50));
      const url = await domtoimage.toPng(node, {
        width: CARD_W * 2,
        height: CARD_H * 2,
        quality: 1,
      });
      setDataUrl(url);
      setLoading(false);
    } catch (e) {
      console.error('Permit card snapshot failed', e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setDataUrl(null);
    createSnapshot().finally(() => {
      if (!alive) return;
    });
    return () => {
      alive = false;
    };
  }, [createSnapshot, busMode, permit?.name, permit?.sid, permit?.major, permit?.expiry]);

  return (
    <>
      <IonModal
        id="schoolBusPermitShowModal"
        isOpen={modalOpen}
        onDidDismiss={() => setModalOpen(false)}
      >
        <div className="cardModal" onClick={() => setModalOpen(false)}>
          {/* Show the composed image bigger in modal */}
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="School Bus Permit"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          ) : (
            <LoadingImage />
          )}
        </div>
      </IonModal>

      <div
        className="cardsContainer"
        onClick={() => {
          if (!loading) setModalOpen(true);
        }}
      >
        <div className="cardImg">
          <div className="busCardImg">
            {loading || !dataUrl ? <LoadingImage /> : <img src={dataUrl} alt="permit" />}
          </div>

          {!loading && (
            <div className="busimg">
              <img src={busImgSrc} alt="bus" />
            </div>
          )}
        </div>

        {/* This is the original card markup used for the snapshot */}
        <div className="originalCard">
          <div className="card" ref={cardRef} style={{ width: CARD_W, height: CARD_H }}>
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
                <h1>{busMode === 'meet_class_bus' ? '轉堂校巴證' : '穿梭校巴證'}</h1>
                <h2>
                  {busMode === 'meet_class_bus' ? 'Meet-Class Bus Permit' : 'Shuttle Bus Permit'}
                </h2>
              </div>

              <div className="routeavil">
                <div className="desctxt">
                  <span>持證者獲交通事務處批准乘搭下列的穿梭校巴路線</span>
                  <span>The Permit Holder is allowed to ride on the following routes</span>
                </div>
                <div className="routes">
                  {Object.entries(busRoutes[busMode]).map(([route, gradient]) => (
                    <span className={busMode} key={route} style={{ background: gradient }}>
                      {route}
                    </span>
                  ))}
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
