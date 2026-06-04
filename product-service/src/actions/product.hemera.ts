import hemera from "../configs/hemera";
import { prisma } from "../configs/prisma";


hemera.add(
    {
        topic: "product",
        cmd: "getVariantForCart",
    },
    async (req: any) => {
        const variantId = req.variantId as string;
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: {
                product: true,
                attributes: true,
                variantImages: true,
            },
        });

        if (!variant) {
            return { variant: null };
        }

        const color = variant.attributes.find((a: any) => a.key === "color")?.value ?? null;
        const size = variant.attributes.find((a: any) => a.key === "size")?.value ?? null;
        const imageUrl =
            variant.variantImages.find((i: any) => i.isMain)?.thumbnail
            ?? variant.variantImages[0]?.thumbnail
            ?? null;

        return {
            variant: {
                id: variant.id,
                productId: variant.productId,
                productName: variant.product.name,
                variantSku: variant.sku,
                imageUrl,
                size,
                color,
                price: variant.price,
                discountAmount: 0,
                finalPrice: variant.price,
                stock: variant.stock,
            },
        };
    }
);

hemera.add(
    {
        topic: "product",
        cmd: "decreaseVariantStock",
    },
    async (req: any) => {
        const variantId = req.variantId as string;
        const quantity = Number(req.quantity);

        if (!variantId || quantity <= 0) {
            return { success: false };
        }

        const updated = await prisma.productVariant.updateMany({
            where: {
                id: variantId,
                stock: {
                    gte: quantity,
                },
            },
            data: {
                stock: {
                    decrement: quantity,
                },
            },
        });

        return {
            success: updated.count > 0,
        };
    }
);

hemera.add(
    {
        topic: "product",
        cmd: "increaseVariantStock",
    },
    async (req: any) => {
        const variantId = req.variantId as string;
        const quantity = Number(req.quantity);

        if (!variantId || quantity <= 0) {
            return { success: false };
        }

        await prisma.productVariant.update({
            where: { id: variantId },
            data: {
                stock: {
                    increment: quantity,
                },
            },
        });

        return { success: true };
    }
);
