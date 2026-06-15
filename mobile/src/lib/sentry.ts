import * as Sentry from '@sentry/react-native';
import { env } from './config';

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized || !env.sentryDsn || env.e2eMode) {
    return;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    tracesSampleRate: 1.0,
  });

  sentryInitialized = true;
}

export function recordButtonClickMetric() {
  Sentry.metrics.count('button_click', 1);
}

export function recordQueueDepthMetric(queueDepth: number) {
  Sentry.metrics.gauge('queue_depth', queueDepth);
}

export function recordResponseTimeMetric(responseTimeMs: number) {
  Sentry.metrics.distribution('response_time', responseTimeMs, {
    unit: 'millisecond',
  });
}

export function recordNetworkRequestMetric(endpoint: string, method: string) {
  Sentry.metrics.count('network_request', 1, {
    unit: 'request',
    attributes: {
      endpoint,
      method,
    },
  });
}

export { Sentry };
