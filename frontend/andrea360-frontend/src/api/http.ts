import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8082";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

const AUTH_KEY = "andrea360_basic_auth";

export function setBasicAuthToken(token: string | null) {
  if (token) sessionStorage.setItem(AUTH_KEY, token);
  else sessionStorage.removeItem(AUTH_KEY);
}

export function getBasicAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_KEY);
}

http.interceptors.request.use((config) => {
  const token = getBasicAuthToken();
  if (token) config.headers.Authorization = token;
  return config;
});
