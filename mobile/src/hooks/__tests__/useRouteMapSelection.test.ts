import {
  createRealtimeRouteMapSelection,
  createRouteSearchRouteMapSelection,
} from '../useRouteMapSelection';

describe('route map selection helpers', () => {
  it('builds a realtime selection payload from a realtime row', () => {
    const selection = createRealtimeRouteMapSelection(
      {
        busno: '1',
        direction: 'UP',
        time: '10:05',
        arrived: false,
        warning: false,
        config: { colorCode: '#fff149' },
        nextStation: {
          route: ['MTR', 'NAC'],
          stationName: 'NAC',
          startIndex: 0,
          importantStationAfter: [],
        },
      },
      'token-1',
    );

    expect(selection).toEqual({
      route: ['MTR', 'NAC'],
      currentIndex: 0,
      details: { busNo: '1', stationIndex: 0, token: 'token-1' },
    });
  });

  it('builds a route-search selection payload from a search result', () => {
    const selection = createRouteSearchRouteMapSelection(
      {
        time: 8,
        outputTime: 8,
        waitTime: 0,
        busNo: '2',
        start: 'MTR',
        end: 'NAC',
        route: ['MTR', 'NAC'],
        timeDisplay: 8,
        routeIndex: 0,
        arrivalTime: '10:05',
        config: { colorCode: '#f3b53a' },
        warning: false,
      },
      'token-2',
    );

    expect(selection).toEqual({
      route: ['MTR', 'NAC'],
      currentIndex: 0,
      details: { busNo: '2', stationIndex: 0, token: 'token-2' },
    });
  });
});
