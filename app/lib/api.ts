import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

export const BASE_URL = import.meta.env.VITE_BACKEND_URL_BASE || "http://localhost:6060";

const api = axios.create({
  withCredentials: true,
  baseURL: BASE_URL,
  headers: {
    "X-API-Version": "1",
  },
});

type RetryableConfig = InternalAxiosRequestConfig & { retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest.retried) {
      try {
        originalRequest.retried = true;

        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          return api(originalRequest);
        }

        window.location.href = "/login";
        return Promise.reject(error);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
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

export default api;