import axios from "axios";
import type { ModificationDates, ServerResponse } from "./types";

const apiUrl =
  import.meta.env.VITE_BASE_URL && process.env.NODE_ENV !== "production"
    ? import.meta.env.VITE_BASE_URL
    : "https://cu-bus.online/api/v1/functions";

const axiosInst = axios.create({
  withCredentials: true,
  timeout: process.env.NODE_ENV !== "production" ? 0 : 10_000,
});

export async function fetchRealtime(): Promise<ServerResponse> {
  const res = await axiosInst.get<ServerResponse>(
    `${apiUrl}/getRealtimeData.php`,
    {
      timeout: process.env.NODE_ENV !== "production" ? 0 : 5_000,
    }
  );
  return res.data;
}

export async function fetchServerDates(): Promise<ModificationDates> {
  const res = await axiosInst.get<ModificationDates>(
    `${apiUrl}/getClientData.php`,
    {
      timeout: process.env.NODE_ENV !== "production" ? 0 : 5_000,
    }
  );
  if (typeof res.data === "string" || res.status !== 200) {
    throw new Error("Bad server dates response");
  }
  return res.data;
}

export async function fetchDelta(
  current: ModificationDates | null
): Promise<ServerResponse> {
  const res = await axiosInst.post<ServerResponse>(
    `${apiUrl}/getClientData.php`,
    current ?? {},
    {
      timeout: process.env.NODE_ENV !== "production" ? 0 : 10_000,
    }
  );
  return res.data;
}
