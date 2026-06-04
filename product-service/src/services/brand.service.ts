import cloudinary from "../configs/cloudDinary";
import { prisma } from "../configs/prisma";
import { BadRequest, NotFound } from "../errors/http.error";
import { createBrandDto, updateBrandDto } from "../schemas/brand.schema";
import { generateSlug } from "../utils/slug";
class BrandService {
    async getBrands(query: any) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const search = query.search?.trim() || undefined;
        const skip = (page - 1) * limit;
        const where = {
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            }),
        };
        const [brands, total] = await Promise.all([
            prisma.brand.findMany({
                where,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),
            prisma.brand.count({
                where
            })
        ])
        return {
            brands,
            pagination: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit)
            }
        }
    }
    async addBrand(data: createBrandDto) {
        const { name, description, thumbnail, thumbnailId } = data;
        if (!name) {
            throw new BadRequest("Thiếu thông tin")
        }
        const slug = generateSlug(name)
        const existBrand = await prisma.brand.findUnique({
            where: {
                slug
            }
        })
        if (existBrand) {
            throw new BadRequest("Thương hiệu đã tồn tại")
        }
        return await prisma.brand.create({
            data: {
                name,
                slug,
                thumbnail,
                thumbnailId,
                description
            }
        })
    }
    async uploadLogoBrand(file: Express.Multer.File) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "logo-brand"
        })
        return {
            url: result.secure_url,
            publicId: result.public_id
        }
    }
    async updateBrand(id: string, data: updateBrandDto) {
        if (!id) {
            throw new BadRequest("Thiếu thông tin")
        }
        const findBrand = await prisma.brand.findUnique({
            where: {
                id,
            }
        })
        if (!findBrand) {
            throw new NotFound("Không tìm thấy thương hiệu")
        }
        if (data.thumbnailId && findBrand.thumbnailId) {
            await cloudinary.uploader.destroy(findBrand.thumbnailId)
        }
        const updateData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );
        if (Object.keys(updateData).length === 0) {
            throw new BadRequest("Không có dữ liệu nào cần cập nhật");
        }
        updateData.slug = findBrand.slug;
        if (data.name) {
            updateData.slug = generateSlug(data.name)
        }
        return prisma.brand.update({
            where: { id },
            data: updateData
        })
    }
    async deleteLogoBrandTemp(publicId: string) {
        const k = await cloudinary.uploader.destroy(publicId, { invalidate: true })
        if (!k) {
            throw new BadRequest("Lỗi khi xóa ảnh")
        }
        return k
    }
    async deleteBrand(id: string) {
        const findBrand = await prisma.brand.findUnique({
            where: {
                id,
            }
        })
        if (!findBrand) {
            throw new NotFound("Không tìm thấy thương hiệu")
        }
        return prisma.brand.delete({
            where: {
                id
            }
        })
    }
}
export default new BrandService()