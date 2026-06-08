import { orderClient } from "@/shared/api/axiosClient";
import { API_CART } from "@/shared/constants/api";


export const cartApi = {
    getCarts: async (params) => orderClient.get(API_CART, { params }),
    create: async (payload) => orderClient.post(API_CART, payload),
    update: async (id, payload) => orderClient.patch(`${API_CART}/${id}`, payload),
    delete: async (id) => orderClient.delete(`${API_CART}/${id}`)
}

