import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BusData, SearchStationTempState } from '../../../src/shared-core/app/types';
import { capitalizeFirstLetter } from '../../../src/shared-core/utils/tools';
import { useAppState } from '../providers/AppProvider';

function buildTranslatedBuildings(busData: BusData, stationData: Record<string, string[]>, t: (key: string) => string) {
  const stops = Object.values(busData).flatMap((bus) => bus.stations?.name.filter(Boolean) ?? []);
  const buildings = Object.values(stationData).flatMap((value) => value.filter(Boolean));
  const merged = Array.from(new Set([...(stops ?? []), ...(buildings ?? [])])).sort();

  return merged
    .map((building) => {
      const translatedName = t(building);
      return translatedName ? `${translatedName} (${building.toUpperCase()})` : '';
    })
    .filter(Boolean);
}

function buildTravelDateOptions(busData: BusData) {
  return Array.from(
    new Set(
      Object.values(busData)
        .map((bus) => bus.schedule?.[3])
        .filter(Boolean) as string[],
    ),
  ).filter((value) => !value.includes(','));
}

export function useRouteSearchState() {
  const { t, i18n } = useTranslation('global');
  const { appData, appTempData, setSearchStation } = useAppState();

  const busData = appData.bus ?? {};
  const stationData = appData.station ?? {};

  const { translatedBuildings, travelDateOptions } = useMemo(() => {
    return {
      translatedBuildings: buildTranslatedBuildings(busData as BusData, stationData, t),
      travelDateOptions: buildTravelDateOptions(busData as BusData),
    };
  }, [busData, i18n.language, stationData, t]);

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
      : `WK-${capitalizeFirstLetter(new Date().toLocaleDateString('en-US', { weekday: 'short' }))}`,
  );
  const [selectDate, setSelectDate] = useState<string>(
    typeof searchStation.selectDate === 'string'
      ? searchStation.selectDate
      : new Date().getDay() === 0
        ? 'HD'
        : (travelDateOptions[0] ?? ''),
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
    const nextState: SearchStationTempState = {
      routeSearchStart,
      routeSearchDest,
      departNow,
      selectWeekday,
      selectDate,
      selectHour,
      selectMinute,
    };
    setSearchStation(nextState);
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
