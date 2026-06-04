import { NextFunction, Request, Response } from "express";
import brandService from "../services/brand.service";
import ResponseHandler from "../common/response.handler";
import { createBrandDto, updateBrandDto } from "../schemas/brand.schema";
import { BadRequest } from "../errors/http.error";


class BrandController extends ResponseHandler {
    getBrands = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit, search } = req.query
            const data = await brandService.getBrands({ page, limit, search });
            return this.ok(res, data, "Lấy danh sách thương hiệu thành công")
        } catch (error) {
            next(error)
        }
    }
    addBrand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, description, thumbnail, thumbnailId }: createBrandDto = req.body
            const data = await brandService.addBrand({ name, description, thumbnail, thumbnailId });
            return this.created(res, data, "Thêm thương hiệu thành công")
        } catch (error) {
            next(error)
        }
    }
    uploadLogoBrand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file
            if (!file) {
                throw new BadRequest("Chưa có ảnh")
            }
            const data = await brandService.uploadLogoBrand(file)
            return this.created(res, data, "Upload ảnh thành công")
        } catch (error) {
            next(error)
        }
    }
    updateBrand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }
            const { name, description, thumbnail, thumbnailId, isActive }: updateBrandDto = req.body
            const data = await brandService.updateBrand(id, { name, description, thumbnail, thumbnailId, isActive })
            return this.ok(res, data, "Cập nhật thương hiệu thành công")
        } catch (error) {
            next(error)
        }
    }
    deleteLogoBrandTemp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { publicId } = req.body
            const data = await brandService.deleteLogoBrandTemp(publicId)
            return this.ok(res, data, "Xóa ảnh thành công")
        } catch (error) {
            next(error)
        }
    }
    deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }
            const data = await brandService.deleteBrand(id)
            return this.ok(res, data, "Xóa thương hiệu thành công")
        } catch (error) {
            next(error)
        }
    }

}
export default new BrandController()