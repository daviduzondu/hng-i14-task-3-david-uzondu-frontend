import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL_BASE || "http://localhost:6060";

const api = axios.create({
  withCredentials: true,
  baseURL: BASE_URL,
  headers: {
    "X-API-Version": "1",
  },
});

export async function request<T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return api(config);
}

export { BASE_URL };
export default api;