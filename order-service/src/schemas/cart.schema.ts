import { z } from "zod";

export const addCart = z.object({
    variantId: z.string().cuid(),
    quantity: z.coerce.number()
})
export const updateCart = z.object({
    quantity: z.coerce.number()
})
export type addCartDto = z.infer<typeof addCart>
export type updateCartDto = z.infer<typeof updateCart>