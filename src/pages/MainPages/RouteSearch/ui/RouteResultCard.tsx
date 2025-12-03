import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  informationCircleOutline,
  locateOutline,
  timeOutline,
  warningOutline,
} from 'ionicons/icons';
import { getTextColor } from '../../../../functions/Tools';
import { useTranslation } from 'react-i18next';

type Props = {
  result: any;
  onClick: () => void;
};

const RouteResultCard: React.FC<Props> = ({ result, onClick }) => {
  const { t } = useTranslation('global');
  return (
    <div className="route-result-busno" onClick={onClick}>
      {result.config?.scheduleType === 'reported' && (
        <div className="route-result-busno-details-warning-container">
          <IonIcon icon={informationCircleOutline} />
          <p className="route-result-busno-details-text-detail">
            {(result.config?.scheduleConfig?.count ?? 1) + ' ' + t('bus-reported-by-user')}
          </p>
        </div>
      )}
      <div className="route-result-busno-number-container">
        <svg
          viewBox="0 0 24 24"
          height="1em"
          width="1em"
          className="route-result-busno-icon"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 20H7V21C7 21.5523 6.55228 22 6 22H5C4.44772 22 4 21.5523 4 21V20H3V12H2V8H3V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V8H22V12H21V20H20V21C20 21.5523 19.5523 22 19 22H18C17.4477 22 17 21.5523 17 21V20ZM5 5V14H19V5H5ZM5 16V18H9V16H5ZM15 16V18H19V16H15Z"></path>
          <g>
            <rect x="5" y="5" width="14" height="9" fill={result.config?.colorCode}></rect>
            <text
              x="50%"
              y="10px"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="7"
              fontWeight={600}
              fill={getTextColor(result.config?.colorCode)}
            >
              {result.busNo}
            </text>
          </g>
        </svg>
      </div>

      <div className="route-result-busno-details">
        <div className="route-result-busno-details-route">
          <div className="route-result-busno-simple-route">
            <p className="route-result-busno-details-text-label">{t('bus-start-station')}</p>
            <div className="route-result-busno-details-text-container">
              <IonIcon icon={locateOutline} />
              <p className="route-result-busno-details-text-detail">{result.start}</p>
            </div>
          </div>
          <div className="route-result-busno-details-arrivaltime">
            <p className="route-result-busno-details-text-label">{t('next-bus-arrival-info')}</p>
            <div className="route-result-busno-details-text-container">
              <IonIcon icon={timeOutline} />
              <p className="route-result-busno-details-text-detail">{result.arrivalTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="route-result-busno-details-totaltime">
        <div className="route-result-busno-details-totaltime-container">
          <p className="route-result-busno-details-totaltime-text">
            {result.outputTime > 1000 ? 'N/A' : result.outputTime}
          </p>
          {' min'}
        </div>
        <p className="route-result-busno-details-waittime-desc">{t('wait-time-desc')}</p>
      </div>

      {result.warning && (
        <div className="route-result-busno-details-warning-container">
          <IonIcon icon={warningOutline} />
          <p className="route-result-busno-details-text-detail">{t(result.warning)}</p>
        </div>
      )}
    </div>
  );
};

export default RouteResultCard;
