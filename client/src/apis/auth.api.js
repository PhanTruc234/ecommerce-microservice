import { authClient } from "@/shared/api/axiosClient";
import { API_GET_ME, API_LOGIN, API_LOGOUT, API_REGISTER } from "@/shared/constants/api";
export const authApi = {
    register: (payload) =>
        authClient.post(API_REGISTER, payload),

    login: (payload) =>
        authClient.post(API_LOGIN, payload),

    getMe: () =>
        authClient.get(API_GET_ME),

    logout: () =>
        authClient.get(API_LOGOUT),
};