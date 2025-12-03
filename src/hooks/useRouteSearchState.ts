import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../functions/Tools';
import type { BusData } from '../functions/getRealTime';
import { useAppState } from '@app/providers/AppState';

export function useRouteSearchState() {
  const { t } = useTranslation('global');
  const { appData, appTempData, setAppTempData } = useAppState();

  const { allBuildings, translatedBuildings, travelDateOptions } = useMemo(() => {
    const out = {
      allBuildings: [] as string[],
      translatedBuildings: [] as string[],
      travelDateOptions: [] as string[],
    };

    try {
      const stops = Object.values(appData?.bus as BusData).flatMap((b) =>
        b.stations?.name.filter(Boolean),
      );
      const buildings = Object.values(appData?.station ?? {}).flatMap((arr: any) =>
        (arr as string[]).filter(Boolean),
      );
      const merged = Array.from(
        new Set([...(stops ?? []), ...(buildings ?? [])]),
      ).sort() as string[];

      out.allBuildings = merged;
      out.translatedBuildings = merged
        .map((b) => {
          const name = t(b);
          return name ? `${name} (${b.toUpperCase()})` : '';
        })
        .filter(Boolean);

      const travelDates = Array.from(
        new Set(
          Object.values(appData?.bus as BusData)
            .map((b) => b.schedule?.[3])
            .filter(Boolean) as string[],
        ),
      ).filter((d) => !d.includes(','));
      out.travelDateOptions = travelDates;
    } catch {}

    return out;
  }, [appData?.bus, appData?.station, t]);

  // form state (seed from temp)
  const searchStation = appTempData.searchStation ?? {};

  const [routeSearchStart, setRouteSearchStart] = useState<string>(
    typeof searchStation.routeSearchStart === 'string' ? searchStation.routeSearchStart : '',
  );
  const [routeSearchDest, setRouteSearchDest] = useState<string>(
    typeof searchStation.routeSearchDest === 'string' ? searchStation.routeSearchDest : '',
  );
  const [departNow, setDepartNow] = useState<boolean>(
    typeof searchStation.departNow === 'boolean' ? searchStation.departNow : true,
  );
  const [selectWeekday, setSelectWeekday] = useState<string>(
    typeof searchStation.selectWeekday === 'string'
      ? searchStation.selectWeekday
      : 'WK-' + capitalizeFirstLetter(new Date().toLocaleDateString('en-US', { weekday: 'short' })),
  );
  const [selectDate, setSelectDate] = useState<string>(
    typeof searchStation.selectDate === 'string'
      ? searchStation.selectDate
      : new Date().getDay() === 0
      ? 'HD'
      : travelDateOptions?.[0] ?? '',
  );
  const [selectHour, setSelectHour] = useState<string>(
    typeof searchStation.selectHour === 'string'
      ? searchStation.selectHour
      : new Date().getHours().toString().padStart(2, '0'),
  );
  const [selectMinute, setSelectMinute] = useState<string>(
    typeof searchStation.selectMinute === 'string'
      ? searchStation.selectMinute
      : (Math.floor(new Date().getMinutes() / 5) * 5).toString().padStart(2, '0'),
  );

  const persistTemp = () => {
    setAppTempData('searchStation', {
      routeSearchStart,
      routeSearchDest,
      departNow,
      selectWeekday,
      selectDate,
      selectHour,
      selectMinute,
    });
  };

  return {
    // lists
    translatedBuildings,
    travelDateOptions,
    // form state
    routeSearchStart,
    setRouteSearchStart,
    routeSearchDest,
    setRouteSearchDest,
    departNow,
    setDepartNow,
    selectWeekday,
    setSelectWeekday,
    selectDate,
    setSelectDate,
    selectHour,
    setSelectHour,
    selectMinute,
    setSelectMinute,
    // actions
    persistTemp,
  };
}
