
import { AuthStore } from "@/stores/auth.store";
import { Navigate, Outlet } from "react-router-dom";
export const ProtectAdminRouter = () => {
    const { user } = AuthStore();
    if (!user) {
        return <Navigate to="/login" replace />
    }
    if (user.role !== "ADMIN") {
        return <Navigate to="/" />
    }
    return <Outlet />
}