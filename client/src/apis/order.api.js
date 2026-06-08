import { orderClient } from "@/shared/api/axiosClient";
import { API_CHECKOUT, API_ORDER } from "@/shared/constants/api";


export const orderApi = {
    checkout: async (payload) => {
        return orderClient.post(API_CHECKOUT, payload)
    },
    getOrders: async (params) => {
        return orderClient.get(API_ORDER, { params })
    },
    getMyOrder: async (params) => {
        return orderClient.get(`${API_ORDER}/me`, { params })
    },
    create: async (payload) => {
        return orderClient.post(API_ORDER, payload)
    },
    update: async (id, payload) => {
        return orderClient.patch(`${API_ORDER}/${id}`, payload)
    }
}
