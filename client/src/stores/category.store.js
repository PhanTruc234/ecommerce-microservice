
import { categoryService } from "@/services/category.service";
import { create } from "zustand";


export const categoryStore = create((set, get) => ({
    loading: false,
    error: null,

    add: async (data) => {
        try {
            set({ loading: true, error: null })
            const res = await categoryService.add(data)
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
            const res = await categoryService.update(id, data)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    delete: async (id) => {
        try {
            set({ loading: true, error: null })
            const res = await categoryService.remove(id)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    uploadImg: async (file) => {
        try {
            set({ loading: true, error: null })
            const res = await categoryService.uploadImg(file)
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
            const res = await categoryService.deleteImg(publicId)
            return res
        } catch (error) {
            throw error
        }
    },
}))