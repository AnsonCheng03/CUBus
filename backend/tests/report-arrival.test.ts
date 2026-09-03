import { describe, expect, it, vi } from 'vitest';
import type {
  ReportArrivalRepository,
  ReportRouteStop,
} from '../src/repositories/report-arrival-repository.js';
import { ReportArrivalError, ReportArrivalService } from '../src/services/report-arrival-service.js';

function setup() {
  const repository: ReportArrivalRepository = {
    getStopCoordinates: vi.fn().mockResolvedValue({ Lat: 22.4, Lng: 114.2 }),
    getStopsFrom: vi.fn().mockResolvedValue([
      { Location: 'B', Direction: null, StopOrder: 2, TravelTime: 60 } as ReportRouteStop,
      { Location: 'C', Direction: 'DOWNST', StopOrder: 3, TravelTime: 90 } as ReportRouteStop,
    ]),
    insert: vi.fn().mockResolvedValue(undefined),
    deleteExpiredCalculated: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
  };
  const now = Date.UTC(2026, 8, 2, 4, 0, 0);
  return { repository, service: new ReportArrivalService(repository, () => now), now };
}

describe('ReportArrivalService', () => {
  it('validates the next stop and writes calculated arrivals for later stops', async () => {
    const { repository, service, now } = setup();
    const result = await service.report({
      busNo: '1A',
      stationIndex: 1,
      timestamp: now / 1_000,
      latitude: 22.4,
      longitude: 114.2,
    }, 'client');

    expect(result).toBe('reported-arrival-time');
    expect(repository.getStopCoordinates).toHaveBeenCalledWith('1A', 2);
    expect(repository.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        busNo: '1A', stationName: 'B|', stationIndex: 2, calculatedBaseTime: null,
      }),
    ]);
  });

  it('returns the reported timetable shape and cleans old calculated rows', async () => {
    const { repository, service } = setup();
    vi.mocked(repository.getAll).mockResolvedValue([
      {
        ID: 1,
        Time: '2026-09-02 11:59:30',
        BusNo: '1A',
        stationName: 'B|',
        StationIndex: 2,
        calculatedBaseTime: null,
      } as never,
    ]);
    const reported = await service.getReportedTimetable();

    expect(repository.deleteExpiredCalculated).toHaveBeenCalledOnce();
    expect(reported).toEqual({
      'B|': {
        '1A': [{ count: 1, average_time: '11:59:30' }],
      },
    });
  });

  it('rejects a report that is too far from the next stop', async () => {
    const { service, now } = setup();
    await expect(service.report({
      busNo: '1A', stationIndex: 1, timestamp: now / 1_000,
      latitude: 0, longitude: 0,
    }, 'client')).rejects.toEqual(new ReportArrivalError('report-invalid-distance'));
  });
});
