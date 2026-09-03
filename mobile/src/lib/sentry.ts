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
    integrations: [
      Sentry.feedbackIntegration({
        showBranding: false,
        showName: false,
        showEmail: false,
        enableScreenshot: false,
        enableTakeScreenshot: false,
        formTitle: 'Report a problem',
        messageLabel: 'Description',
        submitButtonLabel: 'Send report',
        successMessageText: 'Thank you for your report!',
      }),
    ],
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

export function showFeedbackWidget() {
  Sentry.showFeedbackWidget();
}

export { Sentry };
