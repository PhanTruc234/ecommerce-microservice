import { paymentService } from "@/services/payment.service";
import { create } from "zustand";

export const paymentStore = create((set, get) => ({
    loading: false,
    error: null,
    createPaymentLink: async (orderId) => {
        try {
            set({ loading: true })
            const res = await paymentService.createPaymentLink(orderId)
            return res;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    getPaymentStatus: async (orderId) => {
        try {
            set({ loading: true })
            const res = await paymentService.getPaymentStatus(orderId)
            return res;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    confirmPayment: async (payload) => {
        try {
            set({ loading: true })
            const res = await paymentService.confirmPayment(payload)
            return res;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" });
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}))