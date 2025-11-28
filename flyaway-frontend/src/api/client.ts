import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3030/api";

const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token?: string) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

export default client;