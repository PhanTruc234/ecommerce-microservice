import { OrderStatus, Prisma } from "@prisma/client";
import hemera from "../configs/hemera";
import { prisma } from "../configs/prisma";
import { BadRequest, NotFound } from "../errors/http.error";
import { CheckoutPreviewDto, CreateOrderDto, GetOrdersDto, UpdateOrderDto } from "../schemas/order.shema";

type ProductVariantForOrder = {
    id: string;
    productId?: string;
    productName?: string;
    variantSku?: string;
    imageUrl?: string | null;
    size?: string | null;
    color?: string | null;
    price: number | string;
    discountAmount?: number | string | null;
    finalPrice?: number | string | null;
    stock: number;
};

const getVariantForOrder = async (variantId: string): Promise<ProductVariantForOrder> => {
    const result = await hemera.act<{ variant: ProductVariantForOrder }>({
        topic: "product",
        cmd: "getVariantForCart",
        variantId,
    });

    if (!result?.data?.variant) {
        throw new NotFound("Không tìm thấy biến thể sản phẩm.");
    }

    return result.data.variant;
};

const decreaseVariantStock = async (variantId: string, quantity: number) => {
    const result = await hemera.act<{ success: boolean }>({
        topic: "product",
        cmd: "decreaseVariantStock",
        variantId,
        quantity,
    });

    if (!result?.data?.success) {
        throw new BadRequest("Hàng tồn kho không đủ");
    }
};

class OrderService {
    private buildOrderCode() {
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        return `ORD-${Date.now()}-${random}`;
    }

    private normalizeVietnamese(text: string) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    }

    private calculateShippingFee(province: string | null | undefined, itemsTotal: number) {
        if (itemsTotal >= 500000) return 0;

        const normalizedProvince = this.normalizeVietnamese(province || "");
        if (!normalizedProvince) return 40000;

        const innerCityKeywords = [
            "ho chi minh",
            "hcm",
            "tp hcm",
            "tphcm",
            "ha noi",
            "hanoi",
            "da nang",
        ];

        const isInnerCity = innerCityKeywords.some((keyword) =>
            normalizedProvince.includes(keyword)
        );

        return isInnerCity ? 25000 : 40000;
    }

    private async buildCheckoutData(userId: string, province?: string, tx: any = prisma) {
        if (!userId) throw new BadRequest("Thiếu thông tin");

        const cart = await tx.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { status: "ACTIVE" },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequest("Giỏ hàng trống");
        }

        const items = await Promise.all(
            cart.items.map(async (item: any) => {
                const variant = await getVariantForOrder(item.variantId);

                if (variant.stock < item.quantity) {
                    throw new BadRequest(`Sản phẩm ${variant.variantSku || item.variantId} không đủ tồn kho`);
                }

                const price = Number(item.price);
                const discountAmount = Number(item.discountAmount || 0);
                const finalPrice = Number(item.finalPrice);
                const lineSubtotal = price * item.quantity;
                const lineDiscount = discountAmount * item.quantity;
                const lineTotal = finalPrice * item.quantity;

                return {
                    cartItemId: item.id,
                    variantId: item.variantId,
                    productId: variant.productId || null,
                    productName: variant.productName || "",
                    variantSku: variant.variantSku || "",
                    imageUrl: variant.imageUrl || null,
                    size: variant.size || null,
                    color: variant.color || null,
                    quantity: item.quantity,
                    stock: variant.stock,
                    price,
                    discountAmount,
                    finalPrice,
                    lineSubtotal,
                    lineDiscount,
                    lineTotal,
                    raw: item,
                };
            })
        );

        const subtotal = items.reduce((sum: number, item: any) => sum + item.lineSubtotal, 0);
        const discountAmount = items.reduce((sum: number, item: any) => sum + item.lineDiscount, 0);
        const itemsTotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
        const shippingFee = this.calculateShippingFee(province, itemsTotal);
        const totalAmount = itemsTotal + shippingFee;

        return {
            cartId: cart.id,
            items,
            summary: {
                totalItems: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
                subtotal,
                discountAmount,
                shippingFee,
                totalAmount,
                shippingProvince: province,
            },
        };
    }

    private statusOrder(): Record<OrderStatus, OrderStatus[]> {
        return {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["PROCESSING", "CANCELLED"],
            PROCESSING: ["SHIPPING", "CANCELLED"],
            SHIPPING: ["DELIVERED"],
            DELIVERED: [],
            CANCELLED: [],
        };
    }

    async getAllOrder(dto: GetOrdersDto) {
        const { limit, page, maxPrice, minPrice, name, orderCode, paymentStatus, sort, status } = dto;
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const minPriceNumber = minPrice !== undefined ? Number(minPrice) : undefined;
        const maxPriceNumber = maxPrice !== undefined ? Number(maxPrice) : undefined;
        const where: Prisma.OrderWhereInput = {
            ...(status && { status }),
            ...(paymentStatus && { paymentStatus }),
            ...(orderCode && {
                orderCode: {
                    contains: orderCode,
                    mode: "insensitive",
                },
            }),
            ...(name && {
                OR: [
                    {
                        receiverName: {
                            contains: name,
                            mode: "insensitive",
                        },
                    },
                    {
                        province: {
                            contains: name,
                            mode: "insensitive",
                        },
                    },
                    {
                        items: {
                            some: {
                                productName: {
                                    contains: name,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                ],
            }),
            ...((minPriceNumber !== undefined || maxPriceNumber !== undefined) && {
                totalAmount: {
                    ...(minPriceNumber !== undefined && { gte: minPriceNumber }),
                    ...(maxPriceNumber !== undefined && { lte: maxPriceNumber }),
                },
            }),
        };

        const orderBy =
            sort === "oldest" ? { createdAt: "asc" as const } :
                sort === "price_asc" ? { totalAmount: "asc" as const } :
                    sort === "price_desc" ? { totalAmount: "desc" as const } :
                        { createdAt: "desc" as const };

        const [total, orders] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.findMany({
                where,
                orderBy,
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                include: { items: true },
            }),
        ]);

        return {
            orders,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        };
    }

    async getMyOrders(userId: string, dto: GetOrdersDto) {
        const { limit, page, maxPrice, minPrice, name, orderCode, paymentStatus, sort, status } = dto;
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const minPriceNumber = minPrice !== undefined ? Number(minPrice) : undefined;
        const maxPriceNumber = maxPrice !== undefined ? Number(maxPrice) : undefined;
        const where: Prisma.OrderWhereInput = {
            userId,
            ...(status && { status }),
            ...(paymentStatus && { paymentStatus }),
            ...(orderCode && {
                orderCode: {
                    contains: orderCode,
                    mode: "insensitive",
                },
            }),
            ...(name && {
                items: {
                    some: {
                        productName: {
                            contains: name,
                            mode: "insensitive",
                        },
                    },
                },
            }),
            ...((minPriceNumber !== undefined || maxPriceNumber !== undefined) && {
                totalAmount: {
                    ...(minPriceNumber !== undefined && { gte: minPriceNumber }),
                    ...(maxPriceNumber !== undefined && { lte: maxPriceNumber }),
                },
            }),
        };

        const orderBy =
            sort === "oldest" ? { createdAt: "asc" as const } :
                sort === "price_asc" ? { totalAmount: "asc" as const } :
                    sort === "price_desc" ? { totalAmount: "desc" as const } :
                        { createdAt: "desc" as const };

        const [total, orders] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.findMany({
                where,
                orderBy,
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                include: { items: true },
            }),
        ]);

        return {
            orders,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        };
    }

    async previewCheckout(userId: string, dto: CheckoutPreviewDto) {
        const checkout = await this.buildCheckoutData(userId, dto.province);
        return {
            items: checkout.items.map(({ raw, ...item }: any) => item),
            summary: checkout.summary,
        };
    }

    async createOrder(userId: string, dto: CreateOrderDto) {
        const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const checkout = await this.buildCheckoutData(userId, dto.province, tx);

            for (const item of checkout.items) {
                await decreaseVariantStock(item.variantId, item.quantity);
            }

            const createdOrder = await tx.order.create({
                data: {
                    orderCode: this.buildOrderCode(),
                    userId,
                    paymentMethod: dto.paymentMethod,
                    paymentStatus: "UNPAID",
                    status: "PENDING",
                    subtotal: new Prisma.Decimal(checkout.summary.subtotal),
                    discountAmount: new Prisma.Decimal(checkout.summary.discountAmount),
                    shippingFee: new Prisma.Decimal(checkout.summary.shippingFee),
                    totalAmount: new Prisma.Decimal(checkout.summary.totalAmount),
                    receiverName: dto.receiverName,
                    receiverPhone: dto.receiverPhone,
                    addressLine: dto.addressLine,
                    ward: dto.ward,
                    province: dto.province,
                    note: dto.note,
                    items: {
                        create: checkout.items.map((item: any) => ({
                            variantId: item.variantId,
                            productId: item.productId,
                            productName: item.productName,
                            variantSku: item.variantSku,
                            imageUrl: item.imageUrl,
                            size: item.size,
                            color: item.color,
                            quantity: item.quantity,
                            price: new Prisma.Decimal(item.price),
                            discountAmount: new Prisma.Decimal(item.discountAmount),
                            finalPrice: new Prisma.Decimal(item.finalPrice),
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            await tx.cartItem.deleteMany({
                where: {
                    id: {
                        in: checkout.items.map((i: any) => i.cartItemId),
                    },
                },
            });

            return createdOrder;
        });

        return order;
    }

    async updateOrder(id: string, dto: UpdateOrderDto) {
        const { status } = dto;
        if (!status) {
            throw new BadRequest("Thiếu trạng thái đơn hàng");
        }

        const statusFlow = this.statusOrder();
        const findOrder = await prisma.order.findUnique({
            where: { id },
        });

        if (!findOrder) {
            throw new NotFound("Không tìm thấy đơn hàng");
        }

        if (findOrder.status === "CANCELLED") {
            throw new BadRequest("Đơn hàng đã bị hủy");
        }

        if (findOrder.status === status) {
            throw new BadRequest("Không thể cập nhật trùng trạng thái hiện tại");
        }

        const currentStatus = findOrder.status as OrderStatus;
        const allowedStatuses = statusFlow[currentStatus];
        if (!allowedStatuses.includes(status as OrderStatus)) {
            throw new BadRequest(`Không thể cập nhật trạng thái từ ${findOrder.status} sang ${status}`);
        }

        return prisma.order.update({
            where: { id },
            data: { status },
            include: { items: true },
        });
    }
}

export default new OrderService();
