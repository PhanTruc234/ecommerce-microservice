import { cartService } from "@/services/cart.service";
import { create } from "zustand";


export const CartStore = create((set, get) => ({
    loading: false,
    error: null,
    cartItems: [],
    cartCount: 0,
    setCartFromServer: (items) => {
        if (!items) return
        set({
            cartItems: items,
            cartCount: items.reduce(
                (sum, item) => sum + item.quantity,
                0
            )
        })
    },
    addToCart: (item) => {
        set((state) => ({
            cartItems: [...state.cartItems, item],
            cartCount:
                item.quantity
        }))
    },
    removeCart: (id) =>
        set((state) => {
            const item = state.cartItems.find(
                i => i.id === id
            )
            return {
                cartItems:
                    state.cartItems.filter(
                        i => i.id !== id
                    ),


                cartCount:
                    state.cartCount -
                    (item?.quantity || 0)
            }
        }),
    create: async (data) => {
        try {
            set({ loading: true, error: null })
            const res = await cartService.create(data)
            get().addToCart(res?.data)
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
            const res = await cartService.update(id, data)
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
            const res = await cartService.delete(id)
            return res
        } catch (error) {
            set({ error: error?.response?.data?.message || "Có lỗi xảy ra" })
            throw error
        } finally {
            set({ loading: false })
        }
    },
}))
