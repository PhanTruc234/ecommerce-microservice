

import { brandService } from "@/services/brand.service";
import { create } from "zustand";


export const brandStore = create((set, get) => ({
    loading: false,
    error: null,

    create: async (data) => {
        try {
            set({ loading: true, error: null })
            const res = await brandService.create(data)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    update: async (id, data) => {
        try {
            set({ loading: true, error: null })
            const res = await brandService.update(id, data)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    remove: async (id) => {
        try {
            set({ loading: true, error: null })
            const res = await brandService.remove(id)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    uploadLogo: async (file) => {
        try {
            set({ loading: true, error: null })
            const res = await brandService.uploadLogo(file)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Upload thất bại" })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    deleteImg: async (publicId) => {
        try {
            const res = await brandService.deleteLogoTemp(publicId)
            return res
        } catch (error) {
            throw error
        }
    },
}))