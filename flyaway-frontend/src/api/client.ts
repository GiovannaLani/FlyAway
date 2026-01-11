import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3030/api";
const ASSETS = import.meta.env.VITE_ASSETS_URL || "http://localhost:3001";

console.log("API URL:", API);
console.log("Assets URL:", ASSETS);

const client = axios.create({
  baseURL: API,
});

export function setAuthToken(token?: string) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

export default client;