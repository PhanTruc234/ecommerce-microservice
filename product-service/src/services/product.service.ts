import cloudinary from "../configs/cloudDinary";
import { prisma } from "../configs/prisma";
import { BadRequest } from "../errors/http.error";
import type {
    AddAttributeDto,
    AddVariantDto,
    createProductDto,
    GetProductsDto,
    UpdateAttributeDto,
    updateProductDto,
    UpdateVariantDto,
} from "../schemas/product.schema";
import { generateSlug } from "../utils/slug";

const generateSku = (value: string) => generateSlug(value).toUpperCase();

const mapProductImages = (images: Array<{ thumbnail?: string; thumbnailId?: string; isMain: boolean }>) =>
    images.map(img => ({
        thumbnail: img.thumbnail,
        thumbnailId: img.thumbnailId,
        isMain: img.isMain,
    }));

const mapVariantImages = (images: Array<{ thumbnail?: string; thumbnailId?: string; isMain: boolean }>) =>
    images.map(img => {
        if (!img.thumbnail) {
            throw new BadRequest("Ảnh variant không được để trống");
        }

        return {
            thumbnail: img.thumbnail,
            thumbnailId: img.thumbnailId,
            isMain: img.isMain,
        };
    });

const productInclude = {
    brand: true,
    productImages: true,
    categories: {
        include: {
            category: true,
        },
    },
    variants: {
        include: {
            attributes: true,
            variantImages: true,
        },
    },
};

class ProductService {
    async getProducts(dto: GetProductsDto) {
        const {
            name,
            slug,
            minPrice,
            maxPrice,
            sort,
            page,
            limit,
            brandId,
            categorySlug,
            inStock,
            color,
            size,
        } = dto;

        const category = categorySlug
            ? await prisma.category.findUnique({ where: { slug: categorySlug } })
            : null;
        const where = {
            ...(name && {
                name: {
                    contains: name,
                    mode: "insensitive" as const,
                },
            }),
            ...(slug && {
                slug: {
                    contains: slug,
                    mode: "insensitive" as const,
                },
            }),
            ...(brandId && { brandId }),
            ...(category && {
                categories: {
                    some: { categoryId: category.id },
                },
            }),
            ...(inStock || color || size
                ? {
                    variants: {
                        some: {
                            ...(inStock && { stock: { gt: 0 } }),
                            AND: [
                                ...(color
                                    ? [{
                                        attributes: {
                                            some: {
                                                key: "color",
                                                value: {
                                                    equals: color,
                                                    mode: "insensitive" as const,
                                                },
                                            },
                                        },
                                    }]
                                    : []),
                                ...(size
                                    ? [{
                                        attributes: {
                                            some: {
                                                key: "size",
                                                value: {
                                                    equals: size,
                                                    mode: "insensitive" as const,
                                                },
                                            },
                                        },
                                    }]
                                    : []),
                            ],
                        },
                    },
                }
                : {}),
            ...((minPrice !== undefined || maxPrice !== undefined) && {
                basePrice: {
                    ...(minPrice !== undefined && { gte: minPrice }),
                    ...(maxPrice !== undefined && { lte: maxPrice }),
                },
            }),
        };

        const orderBy =
            sort === "oldest" ? { createdAt: "asc" as const } :
                sort === "price_asc" ? { basePrice: "asc" as const } :
                    sort === "price_desc" ? { basePrice: "desc" as const } :
                        { createdAt: "desc" as const };

        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: productInclude,
            }),
        ]);

        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getProductById(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: productInclude,
        });
        if (!product) {
            throw new BadRequest("Sản phẩm không tồn tại");
        }

        return { product };
    }

    async addProduct(dto: createProductDto) {
        const slug = generateSlug(dto.name);

        const brand = await prisma.brand.findUnique({
            where: { id: dto.brandId },
        });
        if (!brand) {
            throw new BadRequest("Thương hiệu không tồn tại");
        }

        const primaryCategories = dto.categoryIds.filter(c => c.isPrimary);
        if (primaryCategories.length > 1) {
            throw new BadRequest("Chỉ được 1 danh mục chính");
        }
        if (primaryCategories.length === 0 && dto.categoryIds.length > 0) {
            dto.categoryIds[0].isPrimary = true;
        }

        return prisma.product.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                basePrice: dto.basePrice,
                brandId: dto.brandId,
                productImages: {
                    create: mapProductImages(dto.images),
                },
                categories: {
                    create: dto.categoryIds.map(cat => ({
                        categoryId: cat.id,
                        isPrimary: cat.isPrimary,
                    })),
                },
                variants: {
                    create: dto.variants.map(variant => ({
                        sku: generateSku(`${brand.slug}-${slug}-${variant.attributes.map(attr => `${attr.key}-${attr.value}`).join("-")}`),
                        price: variant.price,
                        stock: variant.stock,
                        attributes: {
                            create: variant.attributes.map(attr => ({
                                key: attr.key,
                                value: attr.value,
                            })),
                        },
                        variantImages: {
                            create: mapVariantImages(variant.images),
                        },
                    })),
                },
            },
            include: productInclude,
        });
    }

    async updateProduct(id: string, dto: updateProductDto) {
        const existing = await prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,
            },
        });
        if (!existing) {
            throw new BadRequest("Sản phẩm không tồn tại");
        }

        let brand = existing.brand;
        if (dto.brandId) {
            const foundBrand = await prisma.brand.findUnique({
                where: { id: dto.brandId },
            });
            if (!foundBrand) {
                throw new BadRequest("Thương hiệu không tồn tại");
            }
            brand = foundBrand;
        }

        if (dto.categoryIds) {
            const primaryCategories = dto.categoryIds.filter(c => c.isPrimary);
            if (primaryCategories.length > 1) {
                throw new BadRequest("Chỉ được 1 danh mục chính");
            }
            if (primaryCategories.length === 0 && dto.categoryIds.length > 0) {
                dto.categoryIds[0].isPrimary = true;
            }
        }

        const productSlug = dto.name ? generateSlug(dto.name) : existing.slug;
        if (dto.name || dto.brandId) {
            const variants = await prisma.productVariant.findMany({
                where: { productId: id },
                include: { attributes: true },
            });

            await Promise.all(variants.map(variant =>
                prisma.productVariant.update({
                    where: { id: variant.id },
                    data: {
                        sku: generateSku(`${brand.slug}-${productSlug}-${variant.attributes.map(attr => `${attr.key}-${attr.value}`).join("-")}`),
                    },
                })
            ));
        }

        return prisma.product.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name, slug: productSlug }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
                ...(dto.brandId && { brandId: dto.brandId }),
                ...(dto.images && {
                    productImages: {
                        deleteMany: {},
                        create: mapProductImages(dto.images),
                    },
                }),
                ...(dto.categoryIds && {
                    categories: {
                        deleteMany: {},
                        create: dto.categoryIds.map(cat => ({
                            categoryId: cat.id,
                            isPrimary: cat.isPrimary,
                        })),
                    },
                }),
            },
            include: productInclude,
        });
    }
    async uploadImgTem(files: Express.Multer.File[], alts?: string[]) {
        if (!files || files.length === 0) {
            throw new BadRequest("Vui lòng chọn ảnh");
        }
        const uploads = await Promise.all(
            files.map((file, index) =>
                cloudinary.uploader.upload(file.path, {
                    folder: "products"
                }).then(result => ({
                    url: result.secure_url,
                    public_id: result.public_id,
                    alt: alts?.[index] || null
                }))
            )
        )
        const images = await Promise.all(
            uploads.map(item =>
                item
            )
        )
        return images
    }
    async deleteImgTem(publicId: string) {
        const l = await cloudinary.uploader.destroy(publicId)
        if (!l) {
            throw new BadRequest("Xóa ảnh bị lỗi")
        }
        return l
    }
    async deleteProduct(id: string) {
        const existing = await prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
            },
        });
        if (!existing) {
            throw new BadRequest("Sản phẩm không tồn tại");
        }
        const variantIds = existing.variants.map(variant => variant.id);
        await prisma.$transaction([
            prisma.variantAttribute.deleteMany({
                where: { variantId: { in: variantIds } },
            }),
            prisma.variantImage.deleteMany({
                where: { variantId: { in: variantIds } },
            }),
            prisma.productVariant.deleteMany({
                where: { productId: id },
            }),
            prisma.productImage.deleteMany({
                where: { productId: id },
            }),
            prisma.productCategory.deleteMany({
                where: { productId: id },
            }),
            prisma.product.delete({
                where: { id },
            }),
        ]);

        return { message: "Xóa sản phẩm thành công" };
    }

    async addVariant(productId: string, dto: AddVariantDto) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                brand: true,
                variants: {
                    include: {
                        attributes: true,
                    },
                },
            },
        });
        if (!product) {
            throw new BadRequest("Sản phẩm không tồn tại");
        }

        const sku = generateSku(`${product.brand.slug}-${product.slug}-${dto.attributes.map(attr => `${attr.key}-${attr.value}`).join("-")}`);
        if (product.variants.some(variant => variant.sku === sku)) {
            throw new BadRequest("Variant với các thuộc tính này đã tồn tại");
        }

        return prisma.productVariant.create({
            data: {
                productId,
                sku,
                price: dto.price,
                stock: dto.stock,
                attributes: {
                    create: dto.attributes.map(attr => ({
                        key: attr.key,
                        value: attr.value,
                    })),
                },
                variantImages: {
                    create: mapVariantImages(dto.images),
                },
            },
            include: {
                attributes: true,
                variantImages: true,
            },
        });
    }

    async updateVariant(productId: string, variantId: string, dto: UpdateVariantDto) {
        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) {
            throw new BadRequest("Variant không tồn tại");
        }

        return prisma.productVariant.update({
            where: { id: variantId },
            data: {
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.stock !== undefined && { stock: dto.stock }),
                ...(dto.images && {
                    variantImages: {
                        deleteMany: {},
                        create: mapVariantImages(dto.images),
                    },
                }),
            },
            include: {
                attributes: true,
                variantImages: true,
            },
        });
    }

    async addAttribute(productId: string, variantId: string, dto: AddAttributeDto) {
        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) {
            throw new BadRequest("Variant không tồn tại");
        }

        return prisma.variantAttribute.create({
            data: {
                variantId: variant.id,
                key: dto.key,
                value: dto.value,
            },
        });
    }
    async updateAttribute(productId: string, variantId: string, attributeId: string, dto: UpdateAttributeDto) {
        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) {
            throw new BadRequest("Variant không tồn tại");
        }
        const attribute = await prisma.variantAttribute.findFirst({
            where: { id: attributeId, variantId },
        });
        if (!attribute) {
            throw new BadRequest("Thuộc tính không tồn tại");
        }
        return prisma.variantAttribute.update({
            where: { id: attributeId },
            data: {
                ...(dto.key !== undefined && { key: dto.key }),
                ...(dto.value !== undefined && { value: dto.value }),
            },
        });
    }
    async deleteVariant(productId: string, variantId: string) {
        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) {
            throw new BadRequest("Variant không tồn tại");
        }

        await prisma.$transaction([
            prisma.variantAttribute.deleteMany({
                where: { variantId },
            }),
            prisma.variantImage.deleteMany({
                where: { variantId },
            }),
            prisma.productVariant.delete({
                where: { id: variantId },
            }),
        ]);

        return { message: "Xóa variant thành công" };
    }

    async deleteAttribute(productId: string, variantId: string, attributeId: string) {
        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) {
            throw new BadRequest("Biến thể không tồn tại");
        }

        const attr = await prisma.variantAttribute.findFirst({
            where: { id: attributeId, variantId },
        });
        if (!attr) {
            throw new BadRequest("Thuộc tính không tồn tại");
        }

        return prisma.variantAttribute.delete({
            where: { id: attributeId },
        });
    }
}

export default new ProductService();
