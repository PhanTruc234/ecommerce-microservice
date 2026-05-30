
import { authService } from "@/services/auth.service";
import { create } from "zustand";
const getStoredUser = () => {
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
};
export const AuthStore = create((set, get) => ({
    user: getStoredUser(),
    loading: false,

    clearState: () => {
        set({ user: null, loading: false });
        localStorage.removeItem("user");
        window.location.href = "/";
    },
    register: async (payload) => {
        try {
            set({ loading: true });
            const res = await authService.register(payload);
            return res;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    login: async (payload) => {
        try {
            set({ loading: true });
            const res = await authService.login(payload);
            if (res?.user) {
                set({ user: res.user });
                localStorage.setItem("user", JSON.stringify(res.user));
            }
            return res;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    getMe: async () => {
        try {
            set({ loading: true });
            const user = await authService.getMe();
            set({ user });
            localStorage.setItem("user", JSON.stringify(user));
            return user;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            await authService.logout();
            get().clearState();
        } catch (error) {
            throw error;
        }
    },
}));