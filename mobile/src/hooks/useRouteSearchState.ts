import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../../../src/shared-core/utils/tools';
import type { BusData } from '../../../src/shared-core/realtime/getRealTime';
import { useAppState } from '../providers/AppProvider';

export function useRouteSearchState() {
  const { t } = useTranslation('global');
  const { appData, appTempData, setAppTempData } = useAppState();

  const { translatedBuildings, travelDateOptions } = useMemo(() => {
    const output = {
      translatedBuildings: [] as string[],
      travelDateOptions: [] as string[],
    };

    try {
      const stops = Object.values(appData?.bus as BusData).flatMap((bus) =>
        bus.stations?.name.filter(Boolean),
      );
      const buildings = Object.values(appData?.station ?? {}).flatMap((value: any) =>
        (value as string[]).filter(Boolean),
      );
      const merged = Array.from(new Set([...(stops ?? []), ...(buildings ?? [])])).sort() as string[];

      output.translatedBuildings = merged
        .map((building) => {
          const name = t(building);
          return name ? `${name} (${building.toUpperCase()})` : '';
        })
        .filter(Boolean);

      output.travelDateOptions = Array.from(
        new Set(
          Object.values(appData?.bus as BusData)
            .map((bus) => bus.schedule?.[3])
            .filter(Boolean) as string[],
        ),
      ).filter((value) => !value.includes(','));
    } catch {
      // keep defaults
    }

    return output;
  }, [appData?.bus, appData?.station, t]);

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
    translatedBuildings,
    travelDateOptions,
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
    persistTemp,
  };
}
