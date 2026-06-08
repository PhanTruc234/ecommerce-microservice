import { productService } from "@/services/product.service";
import { API_PRODUCT } from "@/shared/constants/api";
import useSWR from "swr";
export const useProducts = (filter) => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [API_PRODUCT, filter],
        ([_, filter]) => productService.getProducts(filter),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    return {
        products: data,
        isLoading,
        isValidating,
        refreshProducts: mutate,
    };
};
export const useFlashSale = () => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [`${API_PRODUCT}/flash-sale`],
        ([]) => productService.getFlashSale(),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    return {
        productSales: data,
        isLoading,
        isValidating,
        refreshProductSales: mutate,
    };
}