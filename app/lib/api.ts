import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
  AxiosError,
} from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL_BASE || "http://localhost:6060";

const api = axios.create({
  withCredentials: true,
  baseURL: BASE_URL,
  headers: {
    "X-API-Version": "1",
  },
});

type RetryableConfig = AxiosRequestConfig & { retried?: boolean };

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig;
    if (error.response?.status === 401 && originalRequest && !originalRequest.retried) {
      try {
        originalRequest.retried = true;
        
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        if (data.status === "success" && data.data) {
          localStorage.setItem("access_token", data.data.access_token);
          if (data.data.refresh_token) {
            localStorage.setItem("refresh_token", data.data.refresh_token);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;
          }
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export async function request<T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return api(config);
}

export { BASE_URL };
export default api;