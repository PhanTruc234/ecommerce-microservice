import hemera from "../configs/hemera";
import { prisma } from "../configs/prisma";
import { BadRequest, NotFound } from "../errors/http.error";
import { addCartDto, updateCartDto } from "../schemas/cart.schema";

type ProductVariantForCart = {
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

const getVariantForCart = async (variantId: string): Promise<ProductVariantForCart> => {
    const result = await hemera.act<{ variant: ProductVariantForCart }>({
        topic: "product",
        cmd: "getVariantForCart",
        variantId,
    });

    if (!result?.data?.variant) {
        throw new NotFound("Không tìm thấy biến thể sản phẩm.");
    }

    return result.data.variant;
};

class CartService {
    async getCarts(userId: string, query: any) {
        const page = +query.page || 1;
        const limit = +query.limit || 5;
        const search = query.search?.trim().toLowerCase() || "";
        const skip = (page - 1) * limit;

        if (!userId) {
            throw new BadRequest("Thiếu thông tin");
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return null;
        }

        const cartItems = await prisma.cartItem.findMany({
            where: {
                cartId: cart.id,
                status: "ACTIVE",
            },
            orderBy: { createdAt: "desc" },
        });

        const cartsWithVariant = await Promise.all(
            cartItems.map(async (item: any) => {
                try {
                    const variant = await getVariantForCart(item.variantId);
                    return { ...item, variant };
                } catch {
                    return { ...item, variant: null };
                }
            })
        );

        const filteredCarts = search
            ? cartsWithVariant.filter((item: any) =>
                item.variant?.productName?.toLowerCase().includes(search)
            )
            : cartsWithVariant;

        const pagedCarts = filteredCarts.slice(skip, skip + limit);
        const totalPrice = filteredCarts.reduce(
            (acc: any, cur: any) => acc + cur.quantity * Number(cur.finalPrice),
            0
        );

        return {
            carts: pagedCarts,
            totalPrice,
            pagination: {
                page,
                limit,
                total: Math.ceil(filteredCarts.length / limit),
            },
        };
    }

    async addCart(userId: string, dto: addCartDto) {
        console.log(userId, dto);
        const { quantity, variantId } = dto;

        if (!userId) {
            throw new BadRequest("Thiếu thông tin");
        }

        if (quantity <= 0) {
            throw new BadRequest("Số lượng phải lớn hơn 0");
        }

        const variant = await getVariantForCart(variantId);

        if (variant.stock < quantity) {
            throw new BadRequest("Hàng tồn kho không đủ");
        }

        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        const existingCartItem = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });

        const price = Number(variant.price);
        const discountAmount = Number(variant.discountAmount ?? 0);
        const finalPrice = Number(variant.finalPrice ?? price - discountAmount);

        if (existingCartItem) {
            const newQuantity = existingCartItem.quantity + quantity;

            if (variant.stock < newQuantity) {
                throw new BadRequest("Hàng tồn kho không đủ");
            }

            return prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: newQuantity,
                    price,
                    discountAmount,
                    finalPrice,
                    status: "ACTIVE",
                },
            });
        }

        return prisma.cartItem.create({
            data: {
                cartId: cart.id,
                variantId,
                quantity,
                status: "ACTIVE",
                price,
                discountAmount,
                finalPrice,
            },
        });
    }

    async updateCart(userId: string, dto: updateCartDto, cartItemId: string) {
        const { quantity } = dto;

        if (!userId) {
            throw new BadRequest("Thiếu thông tin");
        }

        if (quantity <= 0) {
            throw new BadRequest("Số lượng phải lớn hơn 0");
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cart: { userId },
            },
        });

        if (!cartItem) {
            throw new NotFound("Không tìm thấy sản phẩm trong giỏ hàng");
        }

        const variant = await getVariantForCart(cartItem.variantId);

        if (variant.stock < quantity) {
            throw new BadRequest("Hàng tồn kho không đủ");
        }

        const price = Number(variant.price);
        const discountAmount = Number(variant.discountAmount ?? 0);
        const finalPrice = Number(variant.finalPrice ?? price - discountAmount);

        return prisma.cartItem.update({
            where: { id: cartItemId },
            data: {
                quantity,
                price,
                discountAmount,
                finalPrice,
            },
        });
    }

    async deleteCart(userId: string, cartItemId: string) {
        if (!userId) {
            throw new BadRequest("Thiếu thông tin");
        }
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cart: { userId },
            },
        });
        if (!cartItem) {
            throw new NotFound("Không tìm thấy sản phẩm trong giỏ hàng");
        }
        return prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    }
}

export default new CartService();
