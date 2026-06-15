import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RouteMapSelection, RouteSearchInput, RouteSearchResult } from '../shared-core/app/types';
import { processBusStatus } from '../shared-core/realtime/getRealTime';
import { calculateRoute } from '../shared-core/routing/getRoute';
import { useAppState } from '../providers/AppProvider';
import { useLogSearchMutation } from '../query/hooks';

type GenerateRouteArgs = Pick<
  RouteSearchInput,
  | 'routeSearchStart'
  | 'routeSearchDest'
  | 'departNow'
  | 'selectWeekday'
  | 'selectDate'
  | 'selectHour'
  | 'selectMinute'
>;

export function useRouteCompute() {
  const { t, i18n } = useTranslation('global');
  const { appData, realtimeData, appSettings } = useAppState();
  const logSearchMutation = useLogSearchMutation();
  const [fetchError, setFetchError] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteSearchResult | null>(null);
  const [routeMap, setRouteMap] = useState<RouteMapSelection | null>(null);

  const generate = useCallback(
    async (args: GenerateRouteArgs) => {
      const services = realtimeData['Status.json'] ?? {};
      const keys = Object.keys(services);
      const current = keys.length > 0 ? services[keys[keys.length - 1]] : {};
      const thirty = keys.length >= 60 ? services[keys[keys.length - 60]] : {};

      const filteredBus = processBusStatus(
        current,
        thirty,
        { ...(appData.bus ?? {}) },
        setFetchError,
      );

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
        appData.station ?? {},
        appData['timetable.json'] ?? {},
        realtimeData['reportedTime.json'] ?? {},
        appSettings,
        (start, dest, departNowFlag) => {
          logSearchMutation.mutate({
            start,
            dest,
            departNow: departNowFlag,
            lang: i18n.language,
            token: appData.token ?? '',
          });
        },
      );

      setRouteResult(result);
    },
    [appData, appSettings, i18n.language, logSearchMutation, realtimeData, t],
  );

  return { routeResult, routeMap, setRouteMap, fetchError, generate };
}
