import React from 'react';
import { render } from '@testing-library/react-native';
import { RouteSearchResultsList } from '../RouteSearchResultsList';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../../RouteBusIcon', () => ({
  RouteBusIcon: () => null,
}));

describe('RouteSearchResultsList', () => {
  it('shows the reported-by-user indicator for reported schedules', async () => {
    const { getByText } = await render(
      <RouteSearchResultsList
        results={[
          {
            time: 0,
            outputTime: 8,
            waitTime: 2,
            busNo: '1A',
            start: 'MTR',
            end: 'Library',
            route: ['MTR', 'Library'],
            timeDisplay: '10:00',
            routeIndex: 0,
            arrivalTime: '2 min',
            config: {
              colorCode: '#630a10',
              scheduleType: 'reported',
              scheduleConfig: { count: 3 },
            },
          },
        ]}
        fetchError={false}
        networkError={false}
        sameStation={false}
        onSelect={() => {}}
        t={(key) => key}
      />,
    );

    expect(getByText('3 bus-reported-by-user')).toBeTruthy();
  });
});
