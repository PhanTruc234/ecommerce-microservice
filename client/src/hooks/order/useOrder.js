
import { orderService } from "@/services/order.service";
import { API_ORDER } from "@/shared/constants/api";
import useSWR from "swr";
export const useOrders = (filter) => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [API_ORDER, filter],
        ([_, filter]) => orderService.getOrders(filter),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    return {
        orders: data,
        isLoading,
        isValidating,
        refreshOrders: mutate,
    };
};
export const useMyOrders = (filter) => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [`${API_ORDER}/me`, filter],
        ([_, filter]) => orderService.getMyOrders(filter),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );
    return {
        myOrders: data,
        isLoading,
        isValidating,
        refreshMyOrders: mutate,
    };
}