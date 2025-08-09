import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const http: AxiosInstance = axios.create({
  timeout: 15000,
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
