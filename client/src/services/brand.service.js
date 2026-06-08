import { brandApi } from "@/apis/brand.api";

export const brandService = {
    async getBrands(params) {
        const res = await brandApi.getBrands(params);
        return res?.data?.data?.brands || [];
    },
    async create(payload) {
        const res = await brandApi.create(payload);
        return res;
    },
    async update(id, payload) {
        const res = await brandApi.update(id, payload);
        return res;
    },
    async uploadLogo(file) {
        const res = await brandApi.uploadLogo(file);
        return res?.data?.data;
    },
    async remove(id) {
        await brandApi.remove(id);
        return true;
    },
    async deleteLogoTemp(publicId) {
        await brandApi.deleteLogoTemp(publicId);
        return true;
    }
}