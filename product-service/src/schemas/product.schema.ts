import { z } from "zod";
const imageSchema = z.object({
    thumbnail: z.string().url("Ảnh không hợp lệ").optional(),
    thumbnailId: z.string().optional(),
    isMain: z.boolean().default(false),
});
export const createProductSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    description: z.string().optional(),
    basePrice: z.number().positive("Giá phải lớn hơn 0"),
    brandId: z.string().min(1, "Brand không được để trống"),
    categoryIds: z.array(z.object({
        id: z.string(),
        isPrimary: z.boolean().default(false)
    })).min(1, "Phải có ít nhất 1 danh mục"),
    status: z.string().default("DRAFT"),
    images: z.array(imageSchema).optional().default([]),
    variants: z.array(z.object({
        price: z.number().positive("Giá variant phải lớn hơn 0"),
        stock: z.number().int().min(0).default(0),
        isActive: z.boolean().default(true),
        attributes: z.array(z.object({
            key: z.string().min(1),
            value: z.string().min(1)
        })).optional().default([]),
        images: z.array(imageSchema).optional().default([]),
    })).min(1, "Phải có ít nhất 1 variant")
});
export const getProductsSchema = z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    minPrice: z.coerce.number().min(0, "minPrice không được âm").optional(),
    maxPrice: z.coerce.number().min(0, "maxPrice không được âm").optional(),
    brandId: z.string().optional(),
    categorySlug: z.string().optional(),
    inStock: z
        .string()
        .optional()
        .transform(val => val === "true"),

    onSale: z
        .string()
        .optional()
        .transform(val => val === "true"),
    size: z.string().optional(),
    color: z.string().optional(),
    sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).default("newest").optional(),

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

export const updateProductSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống").optional(),
    description: z.string().optional(),
    basePrice: z.number().positive("Giá phải lớn hơn 0").optional(),
    brandId: z.string().min(1, "Brand không được để trống").optional(),
    categoryIds: z.array(z.object({
        id: z.string(),
        isPrimary: z.boolean().default(false)
    })).min(1, "Phải có ít nhất 1 danh mục").optional(),
    images: z.array(imageSchema).optional().default([]),
}).refine(
    data => Object.keys(data).some(k => k !== "deleteVariantIds" && data[k as keyof typeof data] !== undefined),
    { message: "Phải có ít nhất 1 trường cần cập nhật" }
);
export const addVariantSchema = z.object({
    price: z.number().positive("Giá variant phải lớn hơn 0"),
    stock: z.number().int().min(0).default(0),
    attributes: z.array(z.object({
        key: z.string().min(1),
        value: z.string().min(1)
    })).optional().default([]),
    images: z.array(imageSchema).optional().default([]),
});

export const updateVariantSchema = z.object({
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    images: z.array(imageSchema).optional().default([]),
});

export const addAttributeSchema = z.object({
    key: z.string().min(1, "Key không được để trống"),
    value: z.string().min(1, "Value không được để trống")
});

export const updateAttributeSchema = z.object({
    key: z.string().min(1).optional(),
    value: z.string().min(1).optional()
});

export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;
export type AddAttributeDto = z.infer<typeof addAttributeSchema>;
export type UpdateAttributeDto = z.infer<typeof updateAttributeSchema>;
export type AddVariantDto = z.infer<typeof addVariantSchema>;
export type createProductDto = z.infer<typeof createProductSchema>
export type GetProductsDto = z.infer<typeof getProductsSchema>;
export type updateProductDto = z.infer<typeof updateProductSchema>