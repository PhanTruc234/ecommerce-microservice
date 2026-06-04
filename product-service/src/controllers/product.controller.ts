import { NextFunction, Request, Response } from "express"
import ResponseHandler from "../common/response.handler";
import { getProductsSchema } from "../schemas/product.schema";
import productService from "../services/product.service";


class ProductController extends ResponseHandler {
    getProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = getProductsSchema.parse(req.query);
            const product = await productService.getProducts(query);
            return this.ok(res, product, "Lấy danh sách sản phẩm thành công");
        } catch (error) {
            next(error);
        }
    }
    getProductById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }
            const product = await productService.getProductById(id)
            return this.ok(res, product, "Lấy sản phẩm thành công")
        } catch (error) {
            next(error)
        }
    }
    addProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const product = await productService.addProduct(req.body);
            return this.created(res, product, "Tạo sản phẩm thành công");
        } catch (error) {
            next(error);
        }
    };
    uploadImgTem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files as Express.Multer.File[]
            const data = await productService.uploadImgTem(files)
            return this.created(res, data, "Upload ảnh thành công")
        } catch (error) {
            next(error)
        }
    }
    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        try {
            const product = await productService.updateProduct(id, req.body);
            return this.ok(res, product, "Cập nhật sản phẩm thành công");
        } catch (error) {
            next(error);
        }
    }
    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        try {
            const result = await productService.deleteProduct(id);
            return this.ok(res, result, "Xóa sản phẩm thành công");
        } catch (error) {
            next(error);
        }
    }
    addVariant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const variant = await productService.addVariant(id, req.body);
            return this.created(res, variant, "Thêm variant thành công");
        } catch (error) {
            next(error);
        }
    }
    updateVariant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const { variantId } = req.params as { variantId: string };
            const variant = await productService.updateVariant(id, variantId, req.body);
            return this.ok(res, variant, "Cập nhật variant thành công");
        } catch (error) {
            next(error);
        }
    }
    addAttribute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const { variantId } = req.params as { variantId: string };
            const attribute = await productService.addAttribute(id, variantId, req.body);
            return this.created(res, attribute, "Thêm thuộc tính variant thành công");
        } catch (error) {
            next(error);
        }
    }
    updateAttribute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const { variantId } = req.params as { variantId: string };
            const { attributeId } = req.params as { attributeId: string };
            const attribute = await productService.updateAttribute(id, variantId, attributeId, req.body);
            return this.ok(res, attribute, "Cập nhật thuộc tính variant thành công");
        } catch (error) {
            next(error);
        }
    }
    deleteImgTem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { publicId } = req.body
            const data = await productService.deleteImgTem(publicId)
            return this.ok(res, data, "Xóa thành công")
        } catch (error) {
            next(error)
        }
    }
    deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const { variantId } = req.params as { variantId: string };
            const result = await productService.deleteVariant(id, variantId);
            return this.ok(res, result, "Xóa variant thành công");
        } catch (error) {
            next(error);
        }
    }
    deleteAttribute = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const { variantId } = req.params as { variantId: string };
            const { attributeId } = req.params as { attributeId: string };
            const attribute = await productService.deleteAttribute(id, variantId, attributeId);
            return this.ok(res, attribute, "Xoá thuộc tính variant thành công");
        } catch (error) {
            next(error);
        }
    }
}
export default new ProductController()