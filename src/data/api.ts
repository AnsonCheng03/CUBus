import { createApiClient } from '../shared-core/data/createApiClient';

const apiUrl =
  import.meta.env.VITE_BASE_URL && process.env.NODE_ENV !== 'production'
    ? import.meta.env.VITE_BASE_URL
    : 'https://cu-bus.online/api/v1/functions';

export const apiClient = createApiClient({
  baseUrl: apiUrl,
  withCredentials: true,
  devMode: process.env.NODE_ENV !== 'production',
});

export const { fetchRealtime, fetchServerDates, fetchDelta } = apiClient;
