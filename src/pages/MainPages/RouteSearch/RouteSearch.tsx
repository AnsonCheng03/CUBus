import { IonPage } from '@ionic/react';
import './RouteSearch.css';
import '../../../pages/MainPages/RouteSearch/RouteSearch.css'; // keep existing css path if needed
import RouteMap from '../../Components/routeMap';

import React, { useEffect } from 'react';

import { useAppState } from '@app/providers/AppState';
import { useRouteSearchState } from '../../../hooks/useRouteSearchState';
import { useRouteCompute } from '../../../hooks/useRouteCompute';
import RouteSearchForm from './ui/RouteSearchForm';
import ResultsList from './ui/ResultsList';

const RouteSearch: React.FC = () => {
  const { appData, networkError } = useAppState();
  const state = useRouteSearchState();
  const { routeResult, routeMap, setRouteMap, fetchError, generate } = useRouteCompute();

  const onSubmit = () =>
    generate({
      routeSearchStart: state.routeSearchStart,
      routeSearchDest: state.routeSearchDest,
      departNow: state.departNow,
      selectWeekday: state.selectWeekday,
      selectDate: state.selectDate,
      selectHour: state.selectHour,
      selectMinute: state.selectMinute,
    });

  // auto recompute on key changes (same deps as before)
  useEffect(() => {
    state.persistTemp();
    onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.routeSearchStart, state.routeSearchDest, state.departNow]);

  // re-run when realtime data changes handled inside useRouteCompute caller (you can lift if needed)

  return (
    <IonPage>
      <div className="route-search-page">
        <div
          className={`route-search-form-container ${
            state.routeSearchStart === '' || (!routeResult.sortedResults && !routeResult.error)
              ? ' empty'
              : ''
          }`}
        >
          <RouteSearchForm
            translatedBuildings={state.translatedBuildings}
            travelDateOptions={state.travelDateOptions}
            state={state}
            onSubmit={onSubmit}
          />
        </div>

        <div className="routeresult">
          <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />
          <ResultsList
            routeResult={routeResult}
            onRefresh={onSubmit}
            onSelect={setRouteMap}
            networkErrorRealtime={networkError.realtime === true}
            fetchError={fetchError}
            token={appData.token}
          />
        </div>

        <RouteMap routeMap={routeMap} setRouteMap={setRouteMap} />
      </div>
    </IonPage>
  );
};

export default RouteSearch;
