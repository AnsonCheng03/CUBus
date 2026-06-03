import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../providers/AppProvider';
import { processBusStatus } from '../../../src/shared-core/realtime/getRealTime';
import { calculateRoute } from '../../../src/shared-core/routing/getRoute';
import { nativeApiClient } from '../lib/nativeApi';
import type { RouteMapSelection } from '../../../src/shared-core/app/types';

export function useRouteCompute() {
  const { t, i18n } = useTranslation('global');
  const { appData, realtimeData, appSettings } = useAppState();
  const [fetchError, setFetchError] = useState(false);
  const [routeResult, setRouteResult] = useState<any>([]);
  const [routeMap, setRouteMap] = useState<RouteMapSelection | null>(null);

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
      const services = realtimeData['Status.json'] ?? {};
      const keys = Object.keys(services);
      const current = keys.length ? services[keys[keys.length - 1]] : [];
      const thirty = keys.length >= 60 ? services[keys[keys.length - 60]] : [];

      let filteredBus = { ...(appData.bus as Record<string, any>) };
      filteredBus = processBusStatus(current, thirty, filteredBus, setFetchError);

      const result = calculateRoute(
        t,
        args.routeSearchStart,
        args.routeSearchDest,
        'building',
        args.selectWeekday,
        args.selectDate,
        args.selectHour,
        args.selectMinute,
        args.departNow,
        filteredBus,
        appData?.station ?? {},
        appData['timetable.json'],
        realtimeData['reportedTime.json'] ?? {},
        appSettings,
        (start: string, dest: string, departNowFlag: boolean) => {
          nativeApiClient.logSearch({
            start,
            dest,
            departNow: departNowFlag,
            lang: i18n.language,
            token: appData.token ?? '',
          }).catch(() => {});
        },
      );

      setRouteResult(result);
    },
    [appData, appSettings, i18n.language, realtimeData, t],
  );

  return { routeResult, routeMap, setRouteMap, fetchError, generate };
}
