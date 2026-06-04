import { Prisma } from "@prisma/client";
import hemera from "../configs/hemera";
import { prisma } from "../configs/prisma";

const serializeOrderForPayment = (order: any) => ({
    ...order,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    shippingFee: Number(order.shippingFee),
    totalAmount: Number(order.totalAmount),
    items: order.items?.map((item: any) => ({
        ...item,
        price: Number(item.price),
        discountAmount: Number(item.discountAmount),
        finalPrice: Number(item.finalPrice),
    })) || [],
});

const increaseVariantStock = async (variantId: string, quantity: number) => {
    await hemera.act({
        topic: "product",
        cmd: "increaseVariantStock",
        variantId,
        quantity,
    });
};

const restoreStockForOrder = async (orderId: string, tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order || order.stockRestoredAt) {
        return order;
    }

    for (const item of order.items) {
        if (!item.variantId) continue;
        await increaseVariantStock(item.variantId, item.quantity);
    }

    return tx.order.update({
        where: { id: orderId },
        data: { stockRestoredAt: new Date() },
        include: { items: true },
    });
};

hemera.add(
    {
        topic: "order",
        cmd: "getOrderForPayment",
    },
    async (req: any) => {
        const where = req.orderCode
            ? { orderCode: req.orderCode }
            : {
                id: req.orderId,
                ...(req.userId && { userId: req.userId }),
                deletedAt: null,
            };

        const order = await prisma.order.findFirst({
            where,
            include: { items: true },
        });

        return {
            order: order ? serializeOrderForPayment(order) : null,
        };
    }
);

hemera.add(
    {
        topic: "order",
        cmd: "markOrderPaid",
    },
    async (req: any) => {
        const order = await prisma.order.findFirst({
            where: {
                id: req.orderId,
                ...(req.userId && { userId: req.userId }),
                deletedAt: null,
            },
        });

        if (!order) {
            return { order: null };
        }

        if (order.paymentStatus === "PAID") {
            return { order: serializeOrderForPayment({ ...order, items: [] }) };
        }

        const updated = await prisma.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: "PAID",
                paidAt: new Date(),
            },
            include: { items: true },
        });

        return {
            order: serializeOrderForPayment(updated),
        };
    }
);

hemera.add(
    {
        topic: "order",
        cmd: "markOrderPaymentFailed",
    },
    async (req: any) => {
        const order = await prisma.$transaction(async (tx) => {
            const current = await tx.order.findFirst({
                where: {
                    id: req.orderId,
                    ...(req.userId && { userId: req.userId }),
                    deletedAt: null,
                },
            });

            if (!current) return null;

            await tx.order.update({
                where: { id: current.id },
                data: {
                    paymentStatus: "FAILED",
                    status: "CANCELLED",
                    cancelledAt: new Date(),
                },
            });

            return restoreStockForOrder(current.id, tx);
        });

        return {
            order: order ? serializeOrderForPayment(order) : null,
        };
    }
);
