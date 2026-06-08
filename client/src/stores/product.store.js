import { productService } from "@/services/product.service";
import { create } from "zustand";

export const productStore = create((set) => ({
    loading: false,
    error: null,
    getProductById: async (id) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.getProductById(id);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    create: async (payload) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.create(payload);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    uploadImg: async (data) => {
        try {
            set({ loading: true, error: null })
            const res = await productService.uploadMultiple(data)
            return res;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },
    update: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.update(id, payload);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    remove: async (id) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.remove(id);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    deleteTemp: async (publicId) => {
        try {
            set({ loading: true, error: null })
            const res = await productService.deleteTemp(publicId)
            return res;
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },
    createVariant: async (productId, payload) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.createVariant(productId, payload);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    updateVariant: async (productId, variantId, payload) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.updateVariant(productId, variantId, payload);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    deleteVariant: async (productId, variantId) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.deleteVariant(productId, variantId);
            return res;
        } catch (error) {
            set({ error: error.message });
        }
        finally {
            set({ loading: false });
        }
    },
    createAttribute: async (productId, variantId, payload) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.createAttribute(productId, variantId, payload);
            return res;
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    updateAttribute: async (productId, variantId, attributeId, payload) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.updateAttribute(productId, variantId, attributeId, payload);
            return res;
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    deleteAttribute: async (productId, variantId, attributeId) => {
        try {
            set({ loading: true, error: null });
            const res = await productService.deleteAttribute(productId, variantId, attributeId);
            return res;
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    }
}))
