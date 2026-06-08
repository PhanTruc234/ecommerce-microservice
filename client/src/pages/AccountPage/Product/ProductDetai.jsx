import { productStore } from '@/stores/product.store'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, ShoppingCart, ChevronRight, Minus, Plus, Truck, RotateCcw, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { fmt } from '@/lib/convertMoney'
import { CartStore } from '@/stores/cart.store'


export const ProductDetail = () => {
    const { slug } = useParams()
    const id = slug.split("-")[0]
    const { getProductById } = productStore()
    const [activeTab, setActiveTab] = useState("description")
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [selectedAttrs, setSelectedAttrs] = useState({})
    const [quantity, setQuantity] = useState(1)
    const [activeImg, setActiveImg] = useState(null)
    const [wishlist, setWishlist] = useState(false)
    const { create, item } = CartStore()
    useEffect(() => {
        if (!id) return
        const fetch = async () => {
            setLoading(true)
            const res = await getProductById(id)
            console.log(res, "llllllllll")
            const p = res
            setProduct(p)
            if (p?.variants?.length > 0) {
                setSelectedVariant(p.variants[0])
                const initAttrs = {}
                p.variants[0].attributes?.forEach(a => { initAttrs[a.key] = a.value })
                setSelectedAttrs(initAttrs)
            }
            const mainImg = p?.productImages?.find(i => i.isMain)?.thumbnail
                || p?.productImages?.[0]?.thumbnail
                || p?.variants?.[0]?.variantImages?.[0]?.thumbnail
            setActiveImg(mainImg)
            setLoading(false)
        }
        fetch()
    }, [id])
    useEffect(() => {
        if (!product) return
        const matched = product.variants.find(v =>
            v.attributes.every(a => selectedAttrs[a.key] === a.value)
        )
        if (matched) {
            setSelectedVariant(matched)
            const varImg = matched.variantImages?.[0]?.imgUrl?.url
            if (varImg) setActiveImg(varImg)
        }
    }, [selectedAttrs])

    const handleAttrSelect = (key, value) => {
        setSelectedAttrs(prev => ({ ...prev, [key]: value }))
    }
    const colorMap = {}
    product?.variants?.forEach(v => {
        const colorAttr = v.attributes.find(a => a.key === 'color')
        if (colorAttr) {
            if (!colorMap[colorAttr.value]) colorMap[colorAttr.value] = []
            colorMap[colorAttr.value].push(v)
        }
    })
    const sizesForColor = colorMap[selectedAttrs.color]
        ?.flatMap(v => v.attributes.filter(a => a.key === 'size').map(a => a.value))
        ?? []
    const uniqueSizes = [...new Set(sizesForColor)]
    const handleColorSelect = (color) => {
        const firstVariant = colorMap[color]?.[0]
        setSelectedAttrs({ color, size: null })
        setSelectedVariant(firstVariant ?? null)
        const varImg = firstVariant?.variantImages?.[0]?.imgUrl?.url
        if (varImg) setActiveImg(varImg)
    }
    const handleSizeSelect = (size) => {
        setSelectedAttrs(prev => ({ ...prev, size }))
        const variant = colorMap[selectedAttrs.color]?.find(v =>
            v.attributes.some(a => a.key === 'size' && a.value === size)
        )
        if (variant) setSelectedVariant(variant)
    }
    const allImages = [
        ...(product?.productImages?.map(i => i.thumbnail).filter(Boolean) || []),
        ...(product?.variants?.flatMap(v => v.variantImages?.map(i => i.thumbnail).filter(Boolean)) || [])
    ]
    const uniqueImages = [...new Set(allImages)]
    const finalPrice = selectedVariant
        ? (selectedVariant.finalPrice ?? Number(selectedVariant.price))
        : (product?.finalPrice ?? Number(product?.basePrice ?? 0))
    const basePrice = selectedVariant
        ? Number(selectedVariant.price)
        : Number(product?.basePrice ?? 0)
    const discountPercent = selectedVariant
        ? (selectedVariant.discountPercent ?? 0)
        : (product?.discountPercent ?? 0)
    const hasDiscount = discountPercent > 0 && finalPrice < basePrice
    const stock = selectedVariant?.stock ?? 0
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-gray-400 text-lg">Đang tải sản phẩm...</div>
        </div>
    )
    if (!product) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Không tìm thấy sản phẩm.</p>
        </div>
    )
    const handleAddToCart = async () => {
        try {
            await create({ variantId: selectedVariant?.id, quantity })
            toast.success("Thêm vào giỏ thành công")
        } catch (error) {
            toast.error("Thêm thất bại")
        }
    }
    console.log(product, "productproduct")
    return (
        <div className="min-h-screen bg-[#f9f9f7] mt-32">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-gray-400">
                <span className="hover:text-gray-700 cursor-pointer">Trang chủ</span>
                <ChevronRight size={14} />
                <span className="hover:text-gray-700 cursor-pointer">Sản phẩm</span>
                <ChevronRight size={14} />
                <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="flex gap-4">
                    {uniqueImages.length > 1 && (
                        <div className="flex flex-col gap-3 w-20 flex-shrink-0">
                            {uniqueImages.map((url, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveImg(url)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeImg === url ? 'border-black' : 'border-transparent'}`}
                                >
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 rounded-2xl overflow-hidden bg-white aspect-square relative">
                        <img
                            src={activeImg || 'https://placehold.co/600x600/f5f5f5/999?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-5 py-2">
                    <div className="flex items-center gap-2">
                        {product.brand?.thumbnail
                            && (
                                <img src={product.brand.thumbnail
                                } alt={product.brand.name} className="w-6 h-6" />
                            )}
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-widest">{product.brand?.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-red-500">{fmt(finalPrice)}</span>
                        {hasDiscount && (
                            <span className="text-lg text-gray-400 line-through">{fmt(basePrice)}</span>
                        )}
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                            Màu sắc: <span className="font-normal">{selectedAttrs.color}</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(colorMap).map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer
                    ${selectedAttrs.color === color
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                    {uniqueSizes.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                                Size: <span className="font-normal">{selectedAttrs.size ?? 'Chưa chọn'}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {uniqueSizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeSelect(size)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer
                        ${selectedAttrs.size === size
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className={`text-sm font-medium ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {stock > 0 ? `Còn ${stock} sản phẩm trong kho` : 'Hết hàng'}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-600">Số lượng:</span>
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="px-6 py-2 font-semibold text-gray-800">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-2">
                        <button
                            disabled={stock === 0}
                            onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-semibold text-base hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ShoppingCart size={20} />
                            Thêm vào giỏ
                        </button>
                        <button
                            onClick={() => setWishlist(w => !w)}
                            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer
                                ${wishlist ? 'bg-red-50 border-red-400 text-red-500' : 'bg-white border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-500'}`}
                        >
                            <Heart size={22} fill={wishlist ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    <div className="h-px bg-gray-200" />
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: Truck, text: 'Miễn phí vận chuyển đơn từ 500.000đ' },
                            { icon: RotateCcw, text: 'Đổi trả trong vòng 30 ngày' },
                            { icon: Shield, text: 'Bảo hành chính hãng 12 tháng' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Icon size={15} />
                                </div>
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {product.description && (
                <div className="max-w-7xl mx-auto px-6 pb-16">
                    <div className="bg-white rounded-2xl p-6">
                        <div className="flex gap-6 border-b mb-6">
                            <button
                                onClick={() => setActiveTab("description")}
                                className={`pb-2 font-semibold ${activeTab === "description"
                                    ? "text-black border-b-2 border-black"
                                    : "text-gray-400"
                                    }`}
                            >
                                Mô tả
                            </button>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {product.description}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}