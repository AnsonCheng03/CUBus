import { IonIcon } from '@ionic/react';
import { locateOutline, locationOutline } from 'ionicons/icons';
import { BsThreeDotsVertical } from 'react-icons/bs';
import AutoComplete from '../../../Components/autoComplete';
import { GPSSelectIcon } from '../../../Components/gpsSelectBox';
import LocationTimeChooser from '../RouteSearchFormTime';
import React from 'react';
import { useAppState } from '@app/providers/AppState';

type Props = {
  translatedBuildings: string[];
  travelDateOptions: string[];
  state: {
    routeSearchStart: string;
    setRouteSearchStart: (v: string) => void;
    routeSearchDest: string;
    setRouteSearchDest: (v: string) => void;
    departNow: boolean;
    setDepartNow: (v: boolean) => void;
    selectWeekday: string;
    setSelectWeekday: (v: string) => void;
    selectDate: string;
    setSelectDate: (v: string) => void;
    selectHour: string;
    setSelectHour: (v: string) => void;
    selectMinute: string;
    setSelectMinute: (v: string) => void;
  };
  onSubmit: () => void;
};

const RouteSearchForm: React.FC<Props> = ({
  translatedBuildings,
  travelDateOptions,
  state,
  onSubmit,
}) => {
  const { appData } = useAppState();
  return (
    <form
      className="route-search-form"
      name="bussearch"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmit();
      }}
    >
      <LocationTimeChooser
        generateRouteResult={onSubmit}
        departNow={state.departNow}
        setDepartNow={state.setDepartNow}
        selectWeekday={state.selectWeekday}
        setSelectWeekday={state.setSelectWeekday}
        selectDate={state.selectDate}
        setSelectDate={state.setSelectDate}
        selectHour={state.selectHour}
        setSelectHour={state.setSelectHour}
        selectMinute={state.selectMinute}
        setSelectMinute={state.setSelectMinute}
        TravelDateOptions={travelDateOptions}
      />

      <div className="search-boxes">
        <div className="info-box optionssel">
          <div className="locationChooserContainer">
            <div className="locationChooser">
              <label htmlFor="Start" id="Start-label">
                <IonIcon icon={locateOutline} />
              </label>
              <div className="locationinputContainer">
                <div className="locationinput">
                  <AutoComplete
                    allBuildings={translatedBuildings}
                    inputState={state.routeSearchStart}
                    setInputState={state.setRouteSearchStart}
                  />
                </div>
                <div className="functionbuttons">
                  <GPSSelectIcon appData={appData} setDest={state.setRouteSearchStart} fullName />
                </div>
              </div>
            </div>
          </div>

          <div className="locationChooserContainer">
            <div className="locationChooser">
              <label htmlFor="Dest" id="Dest-label">
                <IonIcon icon={locationOutline} />
              </label>
              <div className="locationinputContainer">
                <div className="locationinput">
                  <AutoComplete
                    allBuildings={translatedBuildings}
                    inputState={state.routeSearchDest}
                    setInputState={state.setRouteSearchDest}
                  />
                </div>
                <div className="functionbuttons">
                  <GPSSelectIcon appData={appData} setDest={state.setRouteSearchDest} fullName />
                </div>
              </div>
            </div>
          </div>

          <div className="routeDotIcon">
            <BsThreeDotsVertical />
          </div>
        </div>
      </div>
    </form>
  );
};

export default RouteSearchForm;
