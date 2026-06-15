import { processAndSortBuses } from '../realtime/getRealTime';

const t = ((key: string) => key) as any;

describe('shared realtime core', () => {
  it('surfaces important stations after the current stop when available', () => {
    const rows = processAndSortBuses(
      t,
      [
        {
          'MTR|': {
            A: ['10:05:00'],
          },
        },
      ],
      {
        A: {
          stations: {
            name: ['MTR', 'LIB', 'NAC'],
            attr: ['NULL', 'NULL', 'NULL'],
            time: [0, 300, 600],
          },
          colorCode: '#fff149',
        },
      },
      {
        currtime: new Date(0).toISOString(),
        importantStations: ['NAC'],
      },
    );

    expect(rows[0].nextStation).toEqual(
      expect.objectContaining({
        stationName: 'LIB',
        importantStationAfter: ['NAC'],
      }),
    );
  });
});
