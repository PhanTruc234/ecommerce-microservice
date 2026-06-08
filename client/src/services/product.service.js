import { productApi } from "@/apis/product.api";

export const productService = {
    getProducts: async (params) => {
        const res = await productApi.getProducts(params);
        return res?.data?.data;
    },
    getProductById: async (id) => {
        console.log(id)
        const res = await productApi.getProductById(id)
        console.log(res, "resres")
        return res?.data?.data?.product ?? res?.data?.data?.products;

    },
    create: async (payload) => {
        const res = await productApi.create(payload);
        return res?.data?.data;
    },
    async uploadMultiple(files) {
        const res = await productApi.uploadMultiple(files);

        return res?.data?.data || [];
    },
    update: async (id, payload) => {
        const res = await productApi.update(id, payload);
        return res?.data?.data;
    },
    remove: async (id) => {
        await productApi.remove(id);
        return true;
    },
    async deleteTemp(publicId) {
        await productApi.deleteTemp(publicId);
        return true;
    },
    createVariant: async (productId, payload) => {
        const res = await productApi.createVariant(productId, payload);
        return res?.data?.data;
    },
    updateVariant: async (productId, variantId, payload) => {
        const res = await productApi.updateVariant(productId, variantId, payload);
        return res?.data?.data;
    },
    deleteVariant: async (productId, variantId) => {
        await productApi.deleteVariant(productId, variantId);
        return true;
    },
    createAttribute: async (productId, variantId, payload) => {
        const res = await productApi.createAttribute(productId, variantId, payload);
        return res?.data?.data;
    },
    updateAttribute: async (productId, variantId, attributeId, payload) => {
        const res = await productApi.updateAttribute(productId, variantId, attributeId, payload);
        return res?.data?.data;
    },
    deleteAttribute: async (productId, variantId, attributeId) => {
        const res = await productApi.deleteAttribute(productId, variantId, attributeId);
        return true;
    },
}
