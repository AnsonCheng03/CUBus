import type { Logger } from 'pino';

const HONG_KONG_OFFSET_MS = 8 * 60 * 60 * 1_000;
const MINUTE_MS = 60 * 1_000;

type Timer = ReturnType<typeof setTimeout>;
type SetTimeout = (callback: () => void, delay: number) => Timer;
type ClearTimeout = (timer: Timer) => void;

export type ScheduledJobsOptions = {
  runStatus: () => Promise<unknown>;
  runTimetable: () => Promise<unknown>;
  logger: Logger;
  now?: () => Date;
  setTimeout?: SetTimeout;
  clearTimeout?: ClearTimeout;
};

export type ScheduledJobs = {
  stop: () => void;
};

/**
 * Returns the delay until the next Hong Kong wall-clock slot for a cron job
 * that runs every `intervalMinutes` minutes. Hong Kong has no DST changes,
 * so converting to a fixed UTC+8 wall clock keeps this calculation stable.
 */
export function millisecondsUntilNextSchedule(now: Date, intervalMinutes: 1 | 30): number {
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp)) throw new Error('Invalid scheduler date');

  const interval = intervalMinutes * MINUTE_MS;
  const hongKongTimestamp = timestamp + HONG_KONG_OFFSET_MS;
  const nextSlot = (Math.floor(hongKongTimestamp / interval) + 1) * interval;
  return nextSlot - hongKongTimestamp;
}

export function startScheduledJobs(options: ScheduledJobsOptions): ScheduledJobs {
  const now = options.now ?? (() => new Date());
  const setTimeoutFn = options.setTimeout ?? globalThis.setTimeout;
  const clearTimeoutFn = options.clearTimeout ?? globalThis.clearTimeout;
  let stopped = false;
  let statusTimer: Timer | undefined;
  let timetableTimer: Timer | undefined;
  let statusRunning = false;
  let timetableRunning = false;

  const run = async (
    name: string,
    task: () => Promise<unknown>,
    isRunning: () => boolean,
    setRunning: (value: boolean) => void,
  ) => {
    if (stopped || isRunning()) {
      if (isRunning()) options.logger.warn({ job: name }, 'Scheduled job is still running; skipping this run');
      return;
    }

    setRunning(true);
    try {
      await task();
      options.logger.info({ job: name }, 'Scheduled job completed');
    } catch (error) {
      options.logger.error({ err: error, job: name }, 'Scheduled job failed');
    } finally {
      setRunning(false);
    }
  };

  const schedule = (
    intervalMinutes: 1 | 30,
    name: string,
    task: () => Promise<unknown>,
    isRunning: () => boolean,
    setRunning: (value: boolean) => void,
    setTimer: (timer: Timer) => void,
  ) => {
    if (stopped) return;

    const timer = setTimeoutFn(() => {
      if (stopped) return;
      void run(name, task, isRunning, setRunning);
      schedule(intervalMinutes, name, task, isRunning, setRunning, setTimer);
    }, millisecondsUntilNextSchedule(now(), intervalMinutes));
    setTimer(timer);
  };

  schedule(1, 'scrape-status', options.runStatus, () => statusRunning, (value) => {
    statusRunning = value;
  }, (timer) => {
    statusTimer = timer;
  });
  schedule(30, 'generate-timetable', options.runTimetable, () => timetableRunning, (value) => {
    timetableRunning = value;
  }, (timer) => {
    timetableTimer = timer;
  });

  options.logger.info({ timezone: 'Asia/Hong_Kong' }, 'Scheduled jobs started');

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      if (statusTimer) clearTimeoutFn(statusTimer);
      if (timetableTimer) clearTimeoutFn(timetableTimer);
      options.logger.info('Scheduled jobs stopped');
    },
  };
}
