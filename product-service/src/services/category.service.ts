import { Prisma } from "@prisma/client"
import cloudinary from "../configs/cloudDinary"
import { prisma } from "../configs/prisma"
import { BadRequest, NotFound } from "../errors/http.error"
import { createCategoryDto, updateCategoryDto } from "../schemas/category.schema"
import { generateSlug } from "../utils/slug"
import type { Multer } from "multer";
class CatgoryService {
    async getCategoriesAll(query: any) {
        const slug = query?.slug?.trim()
        const categories = await prisma.category.findMany({
            where: {
                parentId: null,
                ...(slug ? { slug } : {})
            },
            include: {
                children: {
                    where: {

                    },
                    include: {
                        children: {
                            where: {

                            },
                        },
                    }
                }
            },
        })
        return {
            categories,
        }
    }
    async getCategoriesLevel1andLevel2() {
        const categories = await prisma.category.findMany({
            where: {
                parentId: null
            },
            include: {
                children: {
                    where: {
                    }
                }
            },
        })
        return {
            categories,
        }
    }
    async getListCategories(query: any) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const parentId = query.parentId
        const skip = (page - 1) * limit
        const [categorieList, total] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: parentId || null,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                }
            }),
            prisma.category.count({
                where: {
                    parentId: parentId || null,
                }
            })
        ])
        return {
            categorieList,
            pagination: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit)
            }
        }
    }
    async addCategory(data: createCategoryDto) {
        const { name, parentId, thumbnail, thumbnailId } = data
        if (!name) {
            throw new BadRequest("Thiếu thông tin danh mục")
        }
        let level = 1
        let parent = null;
        if (parentId) {
            parent = await prisma.category.findUnique({
                where: { id: parentId }
            })
            if (!parent) {
                throw new BadRequest("Danh mục cha không tồn tại")
            }
            level = (parent.level ?? 1) + 1
        }
        if (level === 3 && !thumbnail) {
            throw new BadRequest("Thiếu ảnh cho danh mục")
        }
        const createSlug = parentId
            ? `${parent?.slug}-${generateSlug(name)}`
            : generateSlug(name);
        try {
            return await prisma.category.create({
                data: {
                    name,
                    slug: createSlug,
                    thumbnail,
                    thumbnailId,
                    parentId: parentId || null,
                    level
                }
            })
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                const field = (error.meta?.target as string[] | undefined)?.[0]
                if (field === "slug") {
                    throw new BadRequest("Danh mục đã tồn tại")
                }

                if (field === "code") {
                    throw new BadRequest("Danh mục đã tồn tại")
                }
                throw new BadRequest("Danh mục đã tồn tại")
            }
        }
    }
    async uploadImgCategory(file: Express.Multer.File) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "category-img"
        })
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    }
    async deleteImgCateTem(publicId: string) {
        const k = await cloudinary.uploader.destroy(publicId, { invalidate: true })
        if (!k) {
            throw new BadRequest("Lỗi khi xóa ảnh")
        }
        return k
    }
    async updateCategory(id: string, data: updateCategoryDto) {
        if (!id) {
            throw new BadRequest("Thiếu thông tin")
        }
        const findCate = await prisma.category.findFirst({
            where: {
                id
            }
        })
        if (!findCate) {
            throw new NotFound("Không tim thấy danh mục")
        }
        if (data.parentId && data.parentId === id) {
            throw new BadRequest("Danh mục không thể là cha của chính nó");
        }
        let findParentCate = null;
        if (data.parentId && findCate.level > 1) {
            findParentCate = await prisma.category.findFirst({
                where: {
                    id: data.parentId,
                }
            })
            if ((findCate.level === 2 && findParentCate?.level !== 1) || (findCate.level === 3 && findParentCate?.level !== 2)) {
                throw new NotFound("Không tim thấy danh mục cha")
            }
        }
        if (data.thumbnailId && findCate.thumbnailId) {
            await cloudinary.uploader.destroy(findCate.thumbnailId)
        }
        const updateData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(updateData).length === 0) {
            throw new BadRequest("Không có dữ liệu nào cần cập nhật");
        }
        updateData.slug = findCate.slug;
        if (updateData.name) {
            updateData.slug = findParentCate?.id
                ? `${findParentCate?.slug}-${generateSlug(updateData.name)}`
                : generateSlug(updateData.name);
        }
        updateData.parentId = findCate.level === 1 ? null : updateData.parentId ?? findCate.parentId;
        updateData.imageUrl = findCate.level >= 2 ? updateData.imageUrl ?? findCate.thumbnail : null
        updateData.imagePubclicId = findCate.level >= 2 ? updateData.imagePubclicId ?? findCate.thumbnailId : null
        return prisma.category.update({
            where: { id },
            data: updateData
        });
    }
    async deleteCategory(id: string) {
        if (!id) {
            throw new BadRequest("Thiếu thông tin")
        }
        const findCate = await prisma.category.findFirst({
            where: {
                id,
            }
        })
        if (!findCate) {
            throw new NotFound("Không tìm thấy danh mục")
        }
        if (findCate.level === 1 || findCate.level === 2) {
            const findChildCate = await prisma.category.findFirst({
                where: {
                    parentId: id,
                    level: findCate.level + 1,
                }
            })
            if (findChildCate) {
                throw new BadRequest("Danh mục có danh mục con, nên không thể xóa")
            }
        }
        return await prisma.category.delete({
            where: { id },
        });
    }
}
export default new CatgoryService()