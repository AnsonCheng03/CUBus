import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from './env'; // assumes you already have this; otherwise inline the base URL

export const http: AxiosInstance = axios.create({
  timeout: 15_000,
});

export type HttpOptions = AxiosRequestConfig & {
  query?: Record<string, string | number | boolean | undefined>;
};

function withQuery(url: string, query?: HttpOptions['query']) {
  if (!query) return url;
  const u = new URL(url, window.location.origin);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) u.searchParams.set(k, String(v));
  });
  return u.toString();
}

export async function request<T = unknown>(url: string, opts: HttpOptions = {}) {
  const finalUrl = withQuery(url, opts.query);
  const res = await http.request<T>({ url: finalUrl, ...opts });
  return res.data;
}

export async function get<T = unknown>(url: string, opts: HttpOptions = {}) {
  return request<T>(url, { ...opts, method: 'GET' });
}

export async function post<T = unknown>(url: string, data?: any, opts: HttpOptions = {}) {
  return request<T>(url, { ...opts, method: 'POST', data });
}

/** ---------- Logging helpers (moved from logRepo) ---------- **/

const API_BASE =
  env.VITE_BASE_URL && process.env.NODE_ENV !== 'production'
    ? env.VITE_BASE_URL
    : 'https://cu-bus.online/api/v1/functions';

const PROD_TIMEOUT = process.env.NODE_ENV === 'production' ? { timeout: 10_000 } : {};

/** Generic event logger; extend as needed */
export async function logEvent(payload: Record<string, any>) {
  try {
    await post(API_BASE + '/logData.php', payload, PROD_TIMEOUT);
  } catch {
    // non-fatal; swallow
  }
}

/** Specific convenience wrappers (current call sites) */
export async function logSearch(input: {
  start: string;
  dest: string;
  departNow: boolean;
  lang: string;
  token: string;
}) {
  const { start, dest, departNow, lang, token } = input;
  if (!start || !dest) return;
  return logEvent({
    type: 'search',
    Start: start,
    Dest: dest,
    Departnow: departNow,
    Lang: lang,
    Token: token,
  });
}

export async function logRealtime(input: { dest: string; lang: string; token: string }) {
  const { dest, lang, token } = input;
  if (!dest) return;
  return logEvent({
    type: 'realtime',
    Dest: dest,
    Lang: lang,
    Token: token,
  });
}
