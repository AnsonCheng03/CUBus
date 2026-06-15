import type {
  BusData,
  BusEntry,
  RealtimeStatusSnapshot,
  RealtimeStatusTimeline,
} from '../app/types';
import { outputDate } from '../utils/tools';

function getWeekdayKey(now: Date) {
  return `WK-${now
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toUpperCase()}`;
}

function deriveBusWarning(busEntry: BusEntry, now: Date) {
  if (busEntry.stats?.status === 'no' && busEntry.stats.prevstatus !== 'normal') {
    if (busEntry.schedule?.[0] && outputDate(busEntry.schedule[0]).getTime() > now.getTime()) {
      return 'First-bus-not-start';
    }
    return 'No-bus-available';
  }

  if (busEntry.stats?.status && busEntry.stats.status !== 'normal') {
    if (busEntry.stats.status === 'delay') return 'Bus-delayed';
    if (busEntry.stats.status === 'suspended') return 'Bus-suspended';
    return 'Bus-status-unusual';
  }

  return busEntry.schedule?.[5] ?? '';
}

export function filterBusesBySchedule(bus: BusData, now = new Date()): BusData {
  const weekday = getWeekdayKey(now);
  return Object.fromEntries(
    Object.entries(bus).filter(([, busData]) => busData.schedule?.[4].toUpperCase().includes(weekday)),
  );
}

export function getRealtimeServiceSnapshots(busServices: RealtimeStatusTimeline) {
  const keys = Object.keys(busServices);
  return {
    current: keys.length > 0 ? busServices[keys[keys.length - 1]] : {},
    thirtyMinutesAgo: keys.length >= 60 ? busServices[keys[keys.length - 60]] : {},
  };
}

export function processBusStatus(
  currentBusServices: RealtimeStatusSnapshot,
  thirtyMinBusService: RealtimeStatusSnapshot,
  bus: BusData,
  setFetchError?: (value: boolean) => void,
) {
  for (const [busNumber, busStatus] of Object.entries(currentBusServices)) {
    if (!bus[busNumber]) {
      continue;
    }

    const stats = {
      status: busStatus,
      prevstatus: thirtyMinBusService[busNumber] ?? null,
    };
    bus[busNumber].stats = stats;
    if (bus[`${busNumber}#`]) {
      bus[`${busNumber}#`].stats = stats;
    }
  }

  const now = new Date();
  for (const busEntry of Object.values(bus)) {
    busEntry.warning = deriveBusWarning(busEntry, now);
  }

  if (setFetchError) {
    setFetchError(currentBusServices.ERROR === 'fetch');
  }

  return bus;
}
