import hemera from "../config/hemera";
import { payOS } from "../config/payos";
import { BadRequest, NotFound, Unauthorized } from "../errors/http.error";

type OrderItemForPayment = {
    productName: string;
    quantity: number;
    finalPrice: number;
};

type OrderForPayment = {
    id: string;
    orderCode: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: number;
    receiverName: string;
    receiverPhone: string;
    addressLine: string;
    ward?: string | null;
    province: string;
    paidAt?: Date | string | null;
    stockRestoredAt?: Date | string | null;
    items: OrderItemForPayment[];
};

class PaymentService {
    private buildPayosOrderCode(): number {
        const timestamp = Date.now().toString().slice(-10);
        const random = Math.floor(1000 + Math.random() * 9000);

        return Number(`${timestamp}${random}`);
    }

    private async getOrderForPayment(params: {
        orderId?: string;
        userId?: string;
        orderCode?: string;
    }): Promise<OrderForPayment> {
        const result = await hemera.act<{ order: OrderForPayment | null }>({
            topic: "order",
            cmd: "getOrderForPayment",
            ...params,
        });

        if (!result?.data?.order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        return result.data.order;
    }

    private async markOrderPaid(orderId: string, userId?: string): Promise<OrderForPayment> {
        const result = await hemera.act<{ order: OrderForPayment | null }>({
            topic: "order",
            cmd: "markOrderPaid",
            orderId,
            userId,
        });

        if (!result?.data?.order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        return result.data.order;
    }

    private async markOrderPaymentFailed(orderId: string, userId?: string): Promise<OrderForPayment> {
        const result = await hemera.act<{ order: OrderForPayment | null }>({
            topic: "order",
            cmd: "markOrderPaymentFailed",
            orderId,
            userId,
        });

        if (!result?.data?.order) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        return result.data.order;
    }

    async createPaymentLink(userId: string, orderId: string) {
        if (!userId) throw new Unauthorized("Chưa đăng nhập");

        const order = await this.getOrderForPayment({ orderId, userId });

        if (order.paymentStatus === "PAID") {
            throw new BadRequest("Đơn hàng đã được thanh toán");
        }

        if (order.status === "CANCELLED") {
            throw new BadRequest("Đơn hàng đã bị hủy");
        }

        const amount = Math.round(Number(order.totalAmount));

        if (amount <= 0) {
            throw new BadRequest("Số tiền thanh toán không hợp lệ");
        }

        const paymentLink = await payOS.paymentRequests.create({
            orderCode: this.buildPayosOrderCode(),
            amount,
            description: order.orderCode.slice(0, 25),
            returnUrl: `${process.env.PAYOS_RETURN_URL}?orderId=${order.id}`,
            cancelUrl: `${process.env.PAYOS_CANCEL_URL}?orderId=${order.id}`,
            buyerName: order.receiverName,
            buyerPhone: order.receiverPhone,
            buyerAddress: `${order.addressLine}, ${order.ward || ""}, ${order.province}`,
            items: order.items.map((item) => ({
                name: item.productName.slice(0, 50),
                quantity: item.quantity,
                price: Math.round(Number(item.finalPrice)),
            })),
        });

        return {
            orderId: order.id,
            orderCode: order.orderCode,
            amount,
            checkoutUrl: paymentLink.checkoutUrl,
            qrCode: paymentLink.qrCode,
            paymentLinkId: paymentLink.paymentLinkId,
            status: paymentLink.status,
        };
    }

    async getPaymentStatus(userId: string, orderId: string) {
        if (!userId) throw new Unauthorized("Chưa đăng nhập");

        const order = await this.getOrderForPayment({ orderId, userId });

        return {
            orderId: order.id,
            orderCode: order.orderCode,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            totalAmount: Number(order.totalAmount),
            paidAt: order.paidAt,
            isPaid: order.paymentStatus === "PAID",
        };
    }

    async confirmPayment(userId: string, orderId: string, payosOrderCode: string) {
        if (!userId) throw new Unauthorized("Chưa đăng nhập");

        const numericPayosOrderCode = Number(payosOrderCode);

        if (!Number.isFinite(numericPayosOrderCode)) {
            throw new BadRequest("Mã giao dịch PayOS không hợp lệ");
        }

        const order = await this.getOrderForPayment({ orderId, userId });
        const paymentLink = await payOS.paymentRequests.get(numericPayosOrderCode);
        const orderAmount = Math.round(Number(order.totalAmount));

        if (paymentLink.amount !== orderAmount) {
            throw new BadRequest("Số tiền thanh toán không khớp với đơn hàng");
        }

        if (paymentLink.status === "PAID") {
            if (paymentLink.amountPaid < orderAmount || paymentLink.amountRemaining !== 0) {
                throw new BadRequest("Đơn hàng chưa được thanh toán đủ");
            }

            const updatedOrder = await this.markOrderPaid(order.id, userId);

            return {
                orderId: updatedOrder.id,
                orderCode: updatedOrder.orderCode,
                orderStatus: updatedOrder.status,
                paymentStatus: updatedOrder.paymentStatus,
                paymentMethod: updatedOrder.paymentMethod,
                totalAmount: Number(updatedOrder.totalAmount),
                isPaid: true,
                paidAt: updatedOrder.paidAt,
                payosStatus: paymentLink.status,
                payosOrderCode: paymentLink.orderCode,
                paymentLinkId: paymentLink.id,
                amountPaid: paymentLink.amountPaid,
                transaction: paymentLink.transactions?.[0] || null,
            };
        }

        const failedStatuses = ["CANCELLED", "EXPIRED", "FAILED"];

        if (failedStatuses.includes(paymentLink.status)) {
            const cancelledOrder = await this.markOrderPaymentFailed(order.id, userId);

            return {
                success: false,
                orderId: cancelledOrder.id,
                orderCode: cancelledOrder.orderCode,
                paymentStatus: cancelledOrder.paymentStatus,
                orderStatus: cancelledOrder.status,
                isPaid: false,
                paidAt: cancelledOrder.paidAt,
                stockRestoredAt: cancelledOrder.stockRestoredAt,
                payosStatus: paymentLink.status,
                payosOrderCode: paymentLink.orderCode,
                paymentLinkId: paymentLink.id,
            };
        }

        return {
            success: false,
            orderId: order.id,
            orderCode: order.orderCode,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            isPaid: false,
            paidAt: order.paidAt,
            payosStatus: paymentLink.status,
            payosOrderCode: paymentLink.orderCode,
            paymentLinkId: paymentLink.id,
            amountPaid: paymentLink.amountPaid,
            amountRemaining: paymentLink.amountRemaining,
        };
    }

    async handleWebhook(body: any) {
        const webhookData = await payOS.webhooks.verify(body);
        const orderCode = webhookData.description as string;
        const order = await this.getOrderForPayment({ orderCode });

        if (order.paymentStatus === "PAID") {
            return {
                success: true,
                message: "Đơn hàng đã được xác nhận thanh toán trước đó",
            };
        }

        if (webhookData.code === "00") {
            await this.markOrderPaid(order.id);
            return {
                success: true,
                message: "Cập nhật thanh toán thành công",
            };
        }

        await this.markOrderPaymentFailed(order.id);

        return {
            success: false,
            message: "Thanh toán thất bại",
        };
    }
}

export default new PaymentService();
