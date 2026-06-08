import { cartService } from "@/services/cart.service";
import { API_CART } from "@/shared/constants/api";
import useSWR from "swr";
export const useCart = (filter) => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [API_CART, filter],
        ([_, filter]) => cartService.getCarts(filter),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
            revalidateIfStale: false,
            revalidateOnMount: true,
        }
    );
    return {
        carts: data,
        isLoading,
        isValidating,
        refreshCart: mutate,
    };
};