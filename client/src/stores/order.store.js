import { orderService } from "@/services/order.service";
import { create } from "zustand";


export const orderStore = create((set) => ({
    loading: false,
    error: null,
    checkoutData: null,
    checkout: async (payload = { province: "" }) => {
        try {
            set({ loading: true, error: null });
            const res = await orderService.checkout(payload);
            const data = res?.data?.data;


            set({ checkoutData: data });
            return data;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },


    create: async (payload) => {
        try {
            set({ loading: true, error: null });
            const res = await orderService.create(payload);
            set({ checkoutData: null });
            return res?.data?.data;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" });
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    update: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const res = await orderService.update(id, payload);
            return res;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" });
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));
