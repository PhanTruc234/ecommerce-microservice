import { categoryService } from "@/services/category.service";
import { API_GET_ALL_CATEGORY, API_GET_CATEGORY_LIST, API_GET_CATEGORY_TREE } from "@/shared/constants/api";
import useSWR from "swr";
export const useCategoryList = (params) => {
    const key = params ? [API_GET_CATEGORY_LIST, params] : null
    const { data, isLoading, mutate } = useSWR(
        key,
        () => categoryService.getList(params),
        { keepPreviousData: true, revalidateOnFocus: false }
    )
    return {
        data: data?.list || [],
        pagination: data?.pagination || {},
        isLoading,
        refresh: mutate,
    }
}
export const useCategory = (filter) => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        [API_GET_ALL_CATEGORY, filter],
        ([_, filter]) => categoryService.getAll(filter),
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    return {
        categories: data,
        isLoading,
        isValidating,
        refreshCategory: mutate,
    };
};
export const useGetCategory = () => {
    const { data, isLoading, isValidating, mutate } = useSWR(
        "category-tree",
        categoryService.getTree
    );

    return {
        categoriesTree: data || [],
        isLoading,
        isValidating,
        refreshCategory: mutate,
    };
};