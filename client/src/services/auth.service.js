import { authApi } from "@/apis/auth.api";

export const authService = {
    async register(payload) {
        const res = await authApi.register(payload);
        const user = res?.data?.data?.user;
        if (!user) throw new Error("Đăng ký thất bại");
        return user;
    },

    async login(payload) {
        const res = await authApi.login(payload);
        const accessToken = res?.data?.data?.accessToken;
        if (!accessToken) throw new Error("Đăng nhập thất bại");
        return {
            accessToken,
            user: res?.data?.data?.user
        };
    },

    async getMe() {
        const res = await authApi.getMe();
        const user = res?.data?.data?.user;
        if (!user) throw new Error("Không lấy được user");
        return user;
    },

    async logout() {
        await authApi.logout();
        return true;
    }
}