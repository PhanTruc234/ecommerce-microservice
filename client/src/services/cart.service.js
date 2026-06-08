import { cartApi } from "@/apis/cart.api"


export const cartService = {
    getCarts: async (params) => {
        const res = await cartApi.getCarts(params)
        return res?.data?.data
    },
    create: async (payload) => {
        const res = await cartApi.create(payload)
        return res?.data
    },
    update: async (id, payload) => {
        const res = await cartApi.update(id, payload)
        return res?.data?.data
    },
    delete: async (id) => {
        const res = await cartApi.delete(id)
        return true
    }
}
