import { AuthStore } from "@/stores/auth.store";
import axios from "axios";

const SERVICES = {
    auth: "http://localhost:3002",
    product: "http://localhost:3003",
    order: "http://localhost:3004",
    payment: "http://localhost:3005",
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) =>
        error ? prom.reject(error) : prom.resolve()
    );
    failedQueue = [];
};

const AUTH_ROUTES = [
    "/api/auths/login",
    "/api/auths/sign-up",
    "/api/auths/refresh",
];

const createClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        withCredentials: true,
    });

    client.interceptors.response.use(
        (res) => res,
        async (error) => {
            const originalRequest = error.config;

            if (!error.response) return Promise.reject(error);

            if (AUTH_ROUTES.some((route) => originalRequest.url === route)) {
                return Promise.reject(error);
            }

            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(() => client(originalRequest));
                }

                isRefreshing = true;

                try {
                    await authClient.post("/api/auths/refresh");
                    processQueue(null);
                    return client(originalRequest);
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

    return client;
};

export const authClient = createClient(SERVICES.auth);
export const productClient = createClient(SERVICES.product);
export const orderClient = createClient(SERVICES.order);
export const paymentClient = createClient(SERVICES.payment);