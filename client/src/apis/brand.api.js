import { productClient } from "@/shared/api/axiosClient";
import { API_BRAND, API_BRAND_DELETE_TEMP, API_BRAND_UPLPAD } from "@/shared/constants/api";

export const brandApi = {
    getBrands: async (params) => {
        return productClient.get(API_BRAND, { params })
    },
    create: async (payload) => productClient.post(API_BRAND, payload),
    update: async (id, payload) => productClient.patch(`${API_BRAND}/${id}`, payload),
    uploadLogo: async (file) => {
        const form = new FormData();
        form.append("logo-brand", file)
        return productClient.post(API_BRAND_UPLPAD, form)
    },
    remove: async (id) => productClient.delete(`${API_BRAND}/${id}`),
    deleteLogoTemp: async (publicId) => productClient.delete(API_BRAND_DELETE_TEMP, { data: { publicId } })
}