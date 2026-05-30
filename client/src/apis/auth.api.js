
import axiosClient from "@/shared/api/axiosClient";
import { API_GET_ME, API_LOGIN, API_LOGOUT, API_REGISTER } from "@/shared/constants/api";


export const authApi = {
    register: (payload) =>
        axiosClient.post(API_REGISTER, payload),

    login: (payload) =>
        axiosClient.post(API_LOGIN, payload),

    getMe: () =>
        axiosClient.get(API_GET_ME),

    logout: () =>
        axiosClient.get(API_LOGOUT),
};