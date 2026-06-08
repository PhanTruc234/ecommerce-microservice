import { brandService } from "@/services/brand.service";
import { API_BRAND } from "@/shared/constants/api";
import useSWR from "swr";
export const useBrand = (filter) => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [API_BRAND, filter],
        ([_, filter]) => brandService.getBrands(filter),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
            dedupingInterval: 5000,
        }
    );

    return {
        brands: data,
        isLoading,
        isValidating,
        refreshBrands: mutate,
    };
};