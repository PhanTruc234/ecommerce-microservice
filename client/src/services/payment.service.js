import { paymentApi } from "@/apis/payment.api"

export const paymentService = {
    createPaymentLink: async (orderId) => {
        const res = await paymentApi.createPayosLink(orderId)
        return res;
    },
    getPaymentStatus: async (orderId) => {
        const res = await paymentApi.getPayosStatus(orderId)

        return res;
    },
    confirmPayment: async (payload) => {
        const res = await paymentApi.confirmPayment(payload)
        return res;
    }
}
