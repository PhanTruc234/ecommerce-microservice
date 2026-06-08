import { orderApi } from "@/apis/order.api"


export const orderService = {
    checkout: async (payload) => {
        const res = await orderApi.checkout(payload)
        return res;
    },
    getOrders: async (params) => {
        const res = await orderApi.getOrders(params)
        return res?.data?.data
    },
    getMyOrders: async (params) => {
        const res = await orderApi.getMyOrder(params)
        return res?.data?.data
    },
    create: async (payload) => {
        const res = await orderApi.create(payload)
        return res;
    },
    update: async (id, payload) => {
        await orderApi.update(id, payload)
        return true
    }
}
