import pino from 'pino';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { millisecondsUntilNextSchedule, startScheduledJobs } from '../src/jobs/scheduler.js';

describe('scheduled jobs', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('aligns schedules to Hong Kong minute boundaries', () => {
    const now = new Date('2026-09-02T04:29:45.000Z');
    expect(millisecondsUntilNextSchedule(now, 1)).toBe(15_000);
    expect(millisecondsUntilNextSchedule(now, 30)).toBe(15_000);

    const justAfterHalfHour = new Date('2026-09-02T04:30:00.001Z');
    expect(millisecondsUntilNextSchedule(justAfterHalfHour, 30)).toBe(1_799_999);
  });

  it('runs both migrated jobs at the next matching cron slot and stops cleanly', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-02T04:29:45.000Z'));
    const runStatus = vi.fn().mockResolvedValue(undefined);
    const runTimetable = vi.fn().mockResolvedValue(undefined);
    const scheduler = startScheduledJobs({
      logger: pino({ enabled: false }),
      runStatus,
      runTimetable,
    });

    await vi.advanceTimersByTimeAsync(15_000);
    expect(runStatus).toHaveBeenCalledOnce();
    expect(runTimetable).toHaveBeenCalledOnce();

    scheduler.stop();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1_000);
    expect(runStatus).toHaveBeenCalledOnce();
    expect(runTimetable).toHaveBeenCalledOnce();
  });
});
