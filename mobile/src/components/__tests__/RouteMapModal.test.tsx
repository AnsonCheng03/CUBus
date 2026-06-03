import React from 'react';
import { render } from '@testing-library/react-native';
import { RouteMapModal } from '../RouteMapModal';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RouteMapModal', () => {
  it('renders current, completed, and upcoming route stops', () => {
    const { getByText } = render(
      <RouteMapModal
        routeMap={{
          route: ['MTR', 'Library', 'College'],
          currentIndex: 1,
          details: { busNo: '1', stationIndex: 1, token: 'abc' },
        }}
        onClose={() => {}}
      />,
    );

    expect(getByText('Passed stop')).toBeTruthy();
    expect(getByText('next-station')).toBeTruthy();
    expect(getByText('Terminal')).toBeTruthy();
    expect(getByText('Library')).toBeTruthy();
  });
});
