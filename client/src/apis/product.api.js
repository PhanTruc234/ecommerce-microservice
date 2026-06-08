import { productClient } from "@/shared/api/axiosClient"
import { API_PRODUCT } from "@/shared/constants/api"

export const productApi = {
    getProducts: async (params) => {
        return productClient.get(API_PRODUCT, { params })
    },
    getProductById: async (id) => {
        return productClient.get(`${API_PRODUCT}/${id}`)
    },
    create: async (payload) => productClient.post(API_PRODUCT, payload),
    uploadMultiple: async (data) => {
        const form = new FormData();
        data.forEach((file) => {
            form.append("products", file)
        })
        return productClient.post(`${API_PRODUCT}/upload`, form)
    },
    update: async (id, payload) => productClient.patch(`${API_PRODUCT}/${id}`, payload),
    remove: async (id) => productClient.delete(`${API_PRODUCT}/${id}`),
    createVariant: async (productId, payload) => productClient.post(`${API_PRODUCT}/${productId}/variants`, payload),
    updateVariant: async (productId, variantId, payload) => productClient.patch(`${API_PRODUCT}/${productId}/variants/${variantId}`, payload),
    deleteVariant: async (productId, variantId) => productClient.delete(`${API_PRODUCT}/${productId}/variants/${variantId}`),
    createAttribute: async (productId, variantId, payload) => productClient.post(`${API_PRODUCT}/${productId}/variants/${variantId}/attributes`, payload),
    updateAttribute: async (productId, variantId, attributeId, payload) => productClient.patch(`${API_PRODUCT}/${productId}/variants/${variantId}/attributes/${attributeId}`, payload),
    deleteAttribute: async (productId, variantId, attributeId) => productClient.delete(`${API_PRODUCT}/${productId}/variants/${variantId}/attributes/${attributeId}`),
    deleteTemp: async (publicId) => productClient.delete(`${API_PRODUCT}/tem`, {
        data: { publicId }
    }),
}