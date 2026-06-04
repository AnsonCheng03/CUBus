import { createApiClient } from '../../../src/shared-core/data/createApiClient';
import { env } from './config';

export const mobileApiClient = createApiClient({
  baseUrl: env.baseUrl,
  withCredentials: true,
  devMode: __DEV__,
});

export const nativeApiClient = mobileApiClient;
