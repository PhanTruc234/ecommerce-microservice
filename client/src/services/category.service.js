import { categoryApi } from "@/apis/category.api";


export const categoryService = {
    async getAll(params) {
        const res = await categoryApi.getAllCategory(params);
        return res?.data?.data?.categories || [];
    },

    async getTree() {
        const res = await categoryApi.getCategory();
        return res?.data?.data?.categories || [];
    },

    async getList(params) {
        const res = await categoryApi.getList(params);

        return {
            list: res?.data?.data?.categorieList || [],
            pagination: res?.data?.data?.pagination || {}
        };
    },

    async add(payload) {
        const res = await categoryApi.add(payload);
        return res?.data?.data;
    },

    async update(id, payload) {
        const res = await categoryApi.update(id, payload);
        return res?.data?.data;
    },

    async remove(id) {
        await categoryApi.delete(id);
        return true;
    },

    async uploadImg(file) {
        const res = await categoryApi.uploadImg(file);
        return res?.data?.data;
    },

    async deleteImg(publicId) {
        await categoryApi.deleteImg(publicId);
        return true;
    }
};