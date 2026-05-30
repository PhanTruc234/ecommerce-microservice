import { useRoutes } from "react-router-dom";
import { accountRoutes } from "./RouteAccount/RouterAccount";
import { adminRoutes } from "./RouterAdmin/RouterAdmin";


export const AppRouter = () => {
    const routes = useRoutes([
        ...accountRoutes,
        ...adminRoutes
    ]);

    return routes;
}