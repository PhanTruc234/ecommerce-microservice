import React, { useEffect, useState } from 'react'
import { useCart } from '@/hooks/cart/useCart'
import { CartStore } from '@/stores/cart.store'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { orderStore } from '@/stores/order.store'
import { fmt } from '@/lib/convertMoney'


const FREE_SHIP_THRESHOLD = 500000
const SHIP_FEE = 30000
export const CartPage = () => {
    const { carts, isLoading, refreshCart } = useCart()
    const { setCartFromServer, update, remove } = CartStore()
    const [items, setItems] = useState([])
    const navigate = useNavigate()
    const { checkout } = orderStore()
    useEffect(() => {
        if (carts?.carts) {
            setCartFromServer(carts.carts)
            setItems(carts.carts.map((item) => ({ ...item, qty: item.quantity })))
        }
    }, [carts?.carts])
    const subtotal = carts?.totalPrice
    const freeShip = subtotal >= FREE_SHIP_THRESHOLD
    const shipFee = freeShip ? 0 : SHIP_FEE
    const grandTotal = subtotal + shipFee


    const changeQty = async (item, type) => {


        const newQty =
            type === "asc" ? item.quantity + 1 : item.quantity - 1
        if (newQty < 1) return
        try {
            await update(item.id, { quantity: newQty })
            toast.success("Sửa thành công")
            await refreshCart()
        } catch (error) {
            toast.error("thất bại")
        }
    }
    const removeItem = async (id) => {
        try {
            await remove(id)
            toast.success("Xóa thành công")
            await refreshCart()
        } catch (error) {
            toast.error("Xóa thất bại")
        }
    }
    const handleCheckout = async () => {
        try {
            await checkout()
            navigate('/checkout')
        } catch (error) {
            toast.error("Thất bại")
        }
    }
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                <p className="text-sm">Đang tải giỏ hàng...</p>
            </div>
        )
    }


    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <ShoppingBag size={56} strokeWidth={1} />
                <p className="text-base">Giỏ hàng của bạn đang trống</p>
                <button
                    onClick={() => navigate('/product')}
                    className="mt-2 px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        )
    }
    console.log(items, "itemsss")
    return (
        <div className="container my-40">
            <h1 className="text-2xl font-semibold mb-6">
                Giỏ hàng
                <span className="text-base font-normal text-gray-400 ml-2">
                    ({items.length} sản phẩm)
                </span>
            </h1>


            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                <div className="flex flex-col gap-3">
                    {items.map((item) => {
                        const img = item.variant?.imageUrl
                        const name = item.variant.productName
                        const unitFinal = Number(item.finalPrice)
                        const unitOriginal = Number(item.price)
                        const unitDiscount = Number(item.discountAmount)
                        return (
                            <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                    {img ? (
                                        <img src={img} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag size={28} className="text-gray-300" strokeWidth={1} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">

                                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                                        {name}
                                    </h3>

                                    <p className="text-xs text-gray-400 mt-1">
                                        SKU: {item.variant?.variantSku}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {item.variant?.color && (
                                            <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                                                {item.variant.color}
                                            </span>
                                        )}

                                        {item.variant?.size && (
                                            <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                                                Size {item.variant.size}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <span className="text-base font-bold text-red-600">
                                            {fmt(unitFinal)}
                                        </span>

                                        {unitDiscount > 0 && (
                                            <>
                                                <span className="text-sm text-gray-400 line-through">
                                                    {fmt(unitOriginal)}
                                                </span>

                                                <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                                                    Tiết kiệm {fmt(unitDiscount)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => changeQty(item, "desc")}
                                            disabled={item.qty <= 1}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                        <button
                                            onClick={() => changeQty(item, "asc")}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                    <span className="text-sm font-semibold">{fmt(unitFinal * item.qty)}</span>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        )
                    })}


                    <button
                        onClick={() => navigate('/product')}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-1"
                    >
                        <ArrowLeft size={14} />
                        Tiếp tục mua sắm
                    </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-20">
                    <p className="text-base font-semibold mb-4">Tóm tắt đơn hàng</p>
                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 mb-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Tạm tính</span>
                            <span>{fmt(subtotal)}</span>
                        </div>
                        {/* {discountTotal > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Giảm giá</span>
                                <span>-{fmt(discountTotal)}</span>
                            </div>
                        )} */}
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Phí vận chuyển</span>
                            <span>{freeShip ? 'Miễn phí' : fmt(SHIP_FEE)}</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-3 mt-1">
                            <span>Tổng cộng</span>
                            <span>{fmt(grandTotal)}</span>
                        </div>
                    </div>


                    <button
                        onClick={handleCheckout}
                        className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Tiến hành thanh toán
                    </button>
                </div>
            </div>
        </div>
    )
}

