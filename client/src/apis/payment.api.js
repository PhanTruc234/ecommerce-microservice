import { paymentClient } from "@/shared/api/axiosClient";
import { API_PAYMENT } from "@/shared/constants/api";

export const paymentApi = {
    createPayosLink: async (orderId) => {
        const res = await paymentClient.post(`${API_PAYMENT}/${orderId}`);
        return res.data.data;
    },
    getPayosStatus: async (orderId) => {
        const res = await paymentClient.get(`${API_PAYMENT}/${orderId}/status`);
        return res.data.data;
    },
    confirmPayment: async (payload) => {
        const res = await paymentClient.post(`${API_PAYMENT}/confirm`, payload);
        return res.data.data;
    }
}
