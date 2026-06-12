import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouteSearchState } from '../useRouteSearchState';

const mockSetSearchStation = jest.fn();
const mockState = {
  appData: {
    bus: {
      A: {
        schedule: ['00:00', '23:59', '10', 'TD', 'WK-Mon', ''],
        stations: { name: ['MTR', 'NAC'], attr: ['NULL', 'NULL'], time: [0, 600] },
      },
    },
    station: {
      MTR: ['MTR'],
      NAC: ['NAC'],
    },
  },
  appTempData: {
    realTimeStation: null,
    searchStation: {
      routeSearchStart: 'Saved Start',
      routeSearchDest: 'Saved Dest',
      departNow: false,
      selectWeekday: 'WK-Tue',
      selectDate: 'TD',
      selectHour: '08',
      selectMinute: '15',
    },
  },
  setSearchStation: mockSetSearchStation,
};

jest.mock('../../providers/AppProvider', () => ({
  useAppState: () => mockState,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

function Consumer() {
  const state = useRouteSearchState();
  return (
    <>
      <Text>{state.routeSearchStart}</Text>
      <Text>{state.routeSearchDest}</Text>
      <Text>{state.selectWeekday}</Text>
      <Pressable onPress={state.persistTemp}>
        <Text>persist</Text>
      </Pressable>
    </>
  );
}

describe('useRouteSearchState', () => {
  beforeEach(() => {
    mockSetSearchStation.mockClear();
  });

  it('restores the saved temporary route-search state', async () => {
    const { getByText } = await render(<Consumer />);

    expect(getByText('Saved Start')).toBeTruthy();
    expect(getByText('Saved Dest')).toBeTruthy();
    expect(getByText('WK-Tue')).toBeTruthy();
  });

  it('persists the current route-search values through the typed provider action', async () => {
    const { getByText } = await render(<Consumer />);
    fireEvent.press(getByText('persist'));

    expect(mockSetSearchStation).toHaveBeenCalledWith({
      routeSearchStart: 'Saved Start',
      routeSearchDest: 'Saved Dest',
      departNow: false,
      selectWeekday: 'WK-Tue',
      selectDate: 'TD',
      selectHour: '08',
      selectMinute: '15',
    });
  });
});
