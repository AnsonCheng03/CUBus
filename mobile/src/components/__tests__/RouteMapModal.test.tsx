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
  it('renders current, completed, and upcoming route stops', async () => {
    const { getByText, queryByText } = await render(
      <RouteMapModal
        routeMap={{
          route: ['MTR', 'Library', 'College'],
          currentIndex: 1,
          details: { busNo: '1', stationIndex: 1, token: 'abc' },
        }}
        onClose={() => {}}
      />,
    );

    expect(getByText('modal-map-title')).toBeTruthy();
    expect(getByText('MTR')).toBeTruthy();
    expect(getByText('Library')).toBeTruthy();
    expect(getByText('College')).toBeTruthy();
    expect(queryByText('next-station')).toBeNull();
  });

  it('renders correctly when the current station is first', async () => {
    const { getByText } = await render(
      <RouteMapModal
        routeMap={{
          route: ['MTR', 'Library', 'College'],
          currentIndex: 0,
          details: { busNo: '1', stationIndex: 0, token: 'abc' },
        }}
        onClose={() => {}}
      />,
    );

    expect(getByText('MTR')).toBeTruthy();
    expect(getByText('Library')).toBeTruthy();
    expect(getByText('College')).toBeTruthy();
  });

  it('renders correctly when the current station is last', async () => {
    const { getByText } = await render(
      <RouteMapModal
        routeMap={{
          route: ['MTR', 'Library', 'College'],
          currentIndex: 2,
          details: { busNo: '1', stationIndex: 2, token: 'abc' },
        }}
        onClose={() => {}}
      />,
    );

    expect(getByText('MTR')).toBeTruthy();
    expect(getByText('Library')).toBeTruthy();
    expect(getByText('College')).toBeTruthy();
  });

  it('renders a one-stop route', async () => {
    const { getByText } = await render(
      <RouteMapModal
        routeMap={{
          route: ['MTR'],
          currentIndex: 0,
          details: { busNo: '1', stationIndex: 0, token: 'abc' },
        }}
        onClose={() => {}}
      />,
    );

    expect(getByText('MTR')).toBeTruthy();
  });
});
