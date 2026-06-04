import { NextFunction, Request, Response } from "express";
import categoryService from "../services/category.service";
import ResponseHandler from "../common/response.handler";
import { createCategoryDto, updateCategoryDto } from "../schemas/category.schema";
import { BadRequest } from "../errors/http.error";



class CategoryController extends ResponseHandler {
    getCategoriesAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { slug } = req.query
            const getData = await categoryService.getCategoriesAll({ slug })
            return this.ok(res, getData, "Lấy dữ liệu danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
    getCategoriesLevel1andLevel2 = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const getData = await categoryService.getCategoriesLevel1andLevel2()
            return this.ok(res, getData, "Lấy dữ liệu danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
    getListCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { parentId, page, limit } = req.query
            const getData = await categoryService.getListCategories({ page, limit, parentId })
            return this.ok(res, getData, "Lấy dữ liệu danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
    addCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, parentId, thumbnail, thumbnailId }: createCategoryDto = req.body
            const newData = await categoryService.addCategory({ name, parentId, thumbnail, thumbnailId })
            return this.created(res, newData, "Thêm danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
    uploadImgCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file

            if (!file) {
                throw new BadRequest("Thiếu ảnh");
            }
            const imgData = await categoryService.uploadImgCategory(file)
            return this.created(res, imgData, "Upload ảnh danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
    deleteImgCateTem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { publicId } = req.body
            const data = await categoryService.deleteImgCateTem(publicId)
            return this.ok(res, data, "Xóa ảnh thành công")
        } catch (error) {
            next(error)
        }
    }
    updateCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }
            const { name, parentId, thumbnail, thumbnailId }: updateCategoryDto = req.body
            const data = await categoryService.updateCategory(id, { name, parentId, thumbnail, thumbnailId });
            return this.ok(res, data, "Cập nhật danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
    deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }
            const data = await categoryService.deleteCategory(id)
            return this.ok(res, data, "Xóa danh mục thành công")
        } catch (error) {
            next(error)
        }
    }
}
export default new CategoryController()