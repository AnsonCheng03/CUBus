import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '@app/providers/AppState';
import { processBusStatus } from '../functions/getRealTime';
import { calculateRoute } from '../functions/getRoute';
import { logSearch } from '@shared/lib/http';

export function useRouteCompute() {
  const { t, i18n } = useTranslation('global');
  const { appData, realtimeData, appSettings } = useAppState();
  const [fetchError, setFetchError] = useState(false);
  const [routeResult, setRouteResult] = useState<any>([]);
  const [routeMap, setRouteMap] = useState<any>([]);

  const generate = useCallback(
    async (args: {
      routeSearchStart: string;
      routeSearchDest: string;
      departNow: boolean;
      selectWeekday: string;
      selectDate: string;
      selectHour: string;
      selectMinute: string;
    }) => {
      const {
        routeSearchStart,
        routeSearchDest,
        departNow,
        selectWeekday,
        selectDate,
        selectHour,
        selectMinute,
      } = args;

      const services = realtimeData['Status.json'] ?? {};
      const keys = Object.keys(services);
      const current = keys.length ? services[keys[keys.length - 1]] : [];
      const thirty = keys.length >= 60 ? services[keys[keys.length - 60]] : [];

      let filteredBus = { ...(appData.bus as Record<string, any>) };
      filteredBus = processBusStatus(current, thirty, filteredBus, setFetchError);

      const res = calculateRoute(
        t,
        routeSearchStart,
        routeSearchDest,
        'building',
        selectWeekday,
        selectDate,
        selectHour,
        selectMinute,
        departNow,
        filteredBus,
        appData?.station ?? {},
        appData['timetable.json'],
        realtimeData['reportedTime.json'] ?? {},
        appSettings,
        (start: string, dest: string, departNowFlag: boolean) =>
          logSearch({
            start,
            dest,
            departNow: departNowFlag,
            lang: i18n.language,
            token: appData.token ?? '',
          }),
      );

      setRouteResult(res);
    },
    [t, i18n.language, appData, realtimeData, appSettings],
  );

  return { routeResult, setRouteMap, routeMap, fetchError, generate };
}
