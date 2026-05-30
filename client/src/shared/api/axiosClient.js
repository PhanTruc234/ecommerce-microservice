import { AuthStore } from "@/stores/auth.store";
import axios from "axios";


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom =>
        error ? prom.reject(error) : prom.resolve()
    );
    failedQueue = [];
};

const AUTH_ROUTES = ["/api/auth/login", "/api/auth/sign-up", "/api/auth/refresh"];

const axiosClient = axios.create({
    baseURL: "http://localhost:3001/",
    withCredentials: true,
});

axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (!error.response) return Promise.reject(error);
        if (AUTH_ROUTES.some(route => originalRequest.url === route)) {
            return Promise.reject(error);
        }
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => axiosClient(originalRequest))
                    .catch(err => Promise.reject(err));
            }
            isRefreshing = true;
            try {
                const res = await axiosClient.post("/api/auth/refresh");
                processQueue(null);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                AuthStore.getState().clearState();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;