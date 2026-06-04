import { z } from "zod";

export const checkoutPreviewSchema = z.object({
    province: z.string().optional(),
});

export const createOrderSchema = z.object({
    paymentMethod: z.enum(["COD", "BANK_TRANSFER", "MOMO", "VNPAY"]).default("COD"),

    receiverName: z.string().min(1, "Tên người nhận không được để trống"),
    receiverPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
    addressLine: z.string().min(1, "Địa chỉ không được để trống"),
    ward: z.string().optional(),
    province: z.string().min(1, "Tỉnh/thành không được để trống"),
    note: z.string().optional(),
});
export const updateOrderSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"]).optional(),
});
export const getOrdersSchema = z.object({
    name: z.string().optional(),
    minPrice: z.coerce.number().min(0, "minPrice không được âm").optional(),
    maxPrice: z.coerce.number().min(0, "maxPrice không được âm").optional(),
    paymentStatus: z.enum(["UNPAID", "PAID", "FAILED"]).optional(),
    status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"]).optional(),
    sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).default("newest").optional(),
    orderCode: z.string().optional(),
    page: z.coerce.number().int().min(1, "page >= 1").default(1),
    limit: z.coerce.number().int().min(1, "limit >= 1").max(100).default(10),
}).refine(
    (data) => {
        if (data.minPrice !== undefined && data.maxPrice !== undefined) {
            return data.minPrice <= data.maxPrice;
        }
        return true;
    },
    { message: "minPrice không được lớn hơn maxPrice", path: ["minPrice"] }
);
export type CheckoutPreviewDto = z.infer<typeof checkoutPreviewSchema>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>
export type GetOrdersDto = z.infer<typeof getOrdersSchema>
