import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouteCompute } from '../useRouteCompute';

const mockLogSearch = jest.fn().mockResolvedValue(undefined);
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
    'timetable.json': {
      'MTR|': {
        A: ['10:05:00'],
      },
    },
    token: 'token-3',
  },
  realtimeData: {
    'Status.json': {},
    'reportedTime.json': {},
  },
  appSettings: {},
};

jest.mock('../../providers/AppProvider', () => ({
  useAppState: () => mockState,
}));

jest.mock('../../lib/api', () => ({
  mobileApiClient: {
    logSearch: (...args: unknown[]) => mockLogSearch(...args),
  },
}));

jest.mock('../../query/hooks', () => ({
  useLogSearchMutation: () => ({
    mutate: (...args: unknown[]) => mockLogSearch(...args),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

function Consumer() {
  const { generate } = useRouteCompute();
  return (
    <Pressable
      onPress={() =>
        generate({
          routeSearchStart: 'MTR (MTR)',
          routeSearchDest: 'NAC (NAC)',
          departNow: true,
          selectWeekday: 'WK-Mon',
          selectDate: 'TD',
          selectHour: '10',
          selectMinute: '00',
        })
      }
    >
      <Text>generate</Text>
    </Pressable>
  );
}

describe('useRouteCompute', () => {
  beforeEach(() => {
    mockLogSearch.mockClear();
  });

  it('logs a route search once for each generate call', async () => {
    const { getByText } = render(<Consumer />);
    fireEvent.press(getByText('generate'));

    await waitFor(() =>
      expect(mockLogSearch).toHaveBeenCalledWith({
        start: 'MTR (MTR)',
        dest: 'NAC (NAC)',
        departNow: true,
        lang: 'en',
        token: 'token-3',
      }),
    );
    expect(mockLogSearch).toHaveBeenCalledTimes(1);
  });
});
