import { productClient } from "@/shared/api/axiosClient";
import { API_CATEGORY_IMG, API_CREATE_CATEGORY, API_GET_ALL_CATEGORY, API_GET_CATEGORY_LIST, API_GET_CATEGORY_TREE } from "@/shared/constants/api";
export const categoryApi = {
    getAllCategory: async (params) => productClient.get(API_GET_ALL_CATEGORY, { params }),
    getCategory: async () => productClient.get(API_GET_CATEGORY_TREE),
    getList: (params) => productClient.get(API_GET_CATEGORY_LIST, { params }),
    add: (data) => productClient.post(API_CREATE_CATEGORY, data),
    update: (id, data) => productClient.patch(`${API_CREATE_CATEGORY}/${id}`, data),
    delete: (id) => productClient.delete(`${API_CREATE_CATEGORY}/${id}`),
    uploadImg: (file) => {
        const form = new FormData()
        form.append("category-img", file)
        return productClient.post(API_CATEGORY_IMG, form)
    },
    deleteImg: (publicId) => productClient.delete(API_CATEGORY_IMG, { data: { publicId } }),
}