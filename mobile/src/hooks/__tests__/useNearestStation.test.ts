import { resolveNearestStationCode } from '../useNearestStation';

jest.mock('../../lib/location', () => ({
  getNearestStation: jest.fn(),
}));

const { getNearestStation } = jest.requireMock('../../lib/location') as {
  getNearestStation: jest.Mock;
};
const translate = ((key: string) => key) as any;

describe('resolveNearestStationCode', () => {
  it('returns the nearest station code when GPS lookup succeeds', async () => {
    getNearestStation.mockResolvedValue([['MTR', { distance: 0.1 }]]);

    await expect(resolveNearestStationCode(translate, {} as never)).resolves.toBe('MTR');
  });

  it('returns null when the nearest lookup reports an error station', async () => {
    getNearestStation.mockResolvedValue([['nearst_error', { error: true }]]);

    await expect(resolveNearestStationCode(translate, {} as never)).resolves.toBeNull();
  });
});
