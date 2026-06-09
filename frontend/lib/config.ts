import { API_BASE_URL } from "@/lib/constants";

export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? API_BASE_URL,
};