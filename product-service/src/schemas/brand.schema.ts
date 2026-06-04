import { z } from "zod";
export const brandParamsSchema = z.object({
    id: z.string().cuid(),
});
export const createBrandSchema = z.object({
    name: z.string().trim().min(1, "Tên không được để trống"),
    thumbnail: z.string().url("Logo phải là URL hợp lệ").nullable().optional(),
    thumbnailId: z.string().nullable().optional(),
    description: z.string().max(500, "Mô tả tối đa 500 ký tự").nullable().optional()
})
export const updateBrandSchema = z.object({
    name: z.string().trim().min(1, "Tên không được để trống").optional(),
    thumbnail: z.string().url("Logo phải là URL hợp lệ").nullable().optional(),
    thumbnailId: z.string().nullable().optional(),
    description: z.string().max(500, "Mô tả tối đa 500 ký tự").nullable().optional(),
    isActive: z.boolean().optional()
});
export type createBrandDto = z.infer<typeof createBrandSchema>
export type updateBrandDto = z.infer<typeof updateBrandSchema>