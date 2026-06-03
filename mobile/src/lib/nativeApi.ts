import { createApiClient } from '../../../src/shared-core/data/createApiClient';
import { env } from './config';

export const nativeApiClient = createApiClient({
  baseUrl: env.baseUrl,
  withCredentials: true,
  devMode: __DEV__,
});
