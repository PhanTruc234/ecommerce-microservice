import { z } from "zod";
export const categoryParamsSchema = z.object({
    id: z.string().cuid(),
});
export const createCategorySchema = z.object({
    name: z.string().trim(),
    parentId: z.string().nullable().optional(),
    thumbnail: z.string().url().nullable().optional(),
    thumbnailId: z.string().nullable().optional()
}).superRefine((data, ctx) => {
    if (!data.parentId && data.thumbnail) {
        ctx.addIssue({
            path: ["thumbnail"],
            code: z.ZodIssueCode.custom,
            message: "Danh mục cha cấp 1 không có ảnh",
        });
    }
})
export const updateCategorySchema = z.object({
    name: z.string().trim().optional(),
    parentId: z.string().nullable().optional(),
    thumbnail: z.string().url().nullable().optional(),
    thumbnailId: z.string().nullable().optional()
})
export type createCategoryDto = z.infer<typeof createCategorySchema>
export type updateCategoryDto = z.infer<typeof updateCategorySchema>