import { useProducts } from '@/hooks/product/useProduct'
import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, Star, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { size } from 'zod'
import { fmt } from '@/lib/convertMoney'


const SORT_OPTIONS = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Cũ nhất', value: 'oldest' },
    { label: 'Giá thấp → cao', value: 'price_asc' },
    { label: 'Giá cao → thấp', value: 'price_desc' },
]
const FILTERS = [
    { label: 'Còn hàng', key: 'inStock' },
    { label: 'Đang giảm giá', key: 'onSale' }
];

const COLORS = [
    { label: 'Đen', value: 'Đen', hex: '#000000' },
    { label: 'Trắng', value: 'Trắng', hex: '#ffffff' },

    { label: 'Xám', value: 'Xám', hex: '#9ca3af' },
    { label: 'Ghi đậm', value: 'Ghi đậm', hex: '#4b5563' },

    { label: 'Đỏ', value: 'Đỏ', hex: '#ef4444' },
    { label: 'Đỏ đô', value: 'Đỏ đô', hex: '#7f1d1d' },
    { label: 'Hồng', value: 'Hồng', hex: '#ec4899' },
    { label: 'Hồng nhạt', value: 'Hồng nhạt', hex: '#fbcfe8' },

    { label: 'Cam', value: 'Cam', hex: '#f97316' },
    { label: 'Vàng', value: 'Vàng', hex: '#facc15' },
    { label: 'Be', value: 'Be', hex: '#f5f5dc' },

    { label: 'Xanh dương', value: 'Xanh dương', hex: '#3b82f6' },
    { label: 'Xanh navy', value: 'Xanh navy', hex: '#1e3a8a' },
    { label: 'Xanh lá', value: 'Xanh lá', hex: '#22c55e' },
    { label: 'Xanh rêu', value: 'Xanh rêu', hex: '#4d7c0f' },

    { label: 'Nâu', value: 'Nâu', hex: '#8b5e3c' },
    { label: 'Nâu nhạt', value: 'Nâu nhạt', hex: '#c4a484' },

    { label: 'Tím', value: 'Tím', hex: '#8b5cf6' },
    { label: 'Tím than', value: 'Tím than', hex: '#312e81' }
]

const SIZES = ['S', 'M', 'L', 'XL']
export const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState("")
    const category = searchParams.get('category')
    const [filters, setFilters] = useState({
        inStock: false,
        onSale: false,
        color: "",
        size: "",
        name: ""
    });
    const [page, setPage] = useState(1)
    const [sort, setSort] = useState('newest')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [appliedMin, setAppliedMin] = useState(undefined)
    const [appliedMax, setAppliedMax] = useState(undefined)
    const [showFilter, setShowFilter] = useState(false)
    const [wishlist, setWishlist] = useState({})

    const { products, isLoading } = useProducts({
        categorySlug: category,
        page,
        limit: 9,
        sort,
        minPrice: appliedMin,
        maxPrice: appliedMax,
        inStock: filters.inStock,
        onSale: filters.onSale,
        color: filters.color,
        size: filters.size,
        name: filters.name
    })

    const productList = products?.products ?? []
    const pagination = products?.pagination ?? {}
    const totalPages = pagination.totalPages ?? 1
    const visiblePages = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const pages = new Set([1, totalPages, page, page - 1, page + 1])

        if (page <= 3) {
            pages.add(2)
            pages.add(3)
            pages.add(4)
        }

        if (page >= totalPages - 2) {
            pages.add(totalPages - 1)
            pages.add(totalPages - 2)
            pages.add(totalPages - 3)
        }

        const sortedPages = [...pages]
            .filter((item) => item >= 1 && item <= totalPages)
            .sort((a, b) => a - b)

        const result = []

        for (let i = 0; i < sortedPages.length; i++) {
            const current = sortedPages[i]
            const previous = sortedPages[i - 1]

            if (i > 0 && current - previous > 1) {
                result.push(`ellipsis-${previous}-${current}`)
            }

            result.push(current)
        }

        return result
    }, [page, totalPages])

    const handleApplyFilter = () => {
        setAppliedMin(minPrice !== '' ? Number(minPrice) : undefined)
        setAppliedMax(maxPrice !== '' ? Number(maxPrice) : undefined)
        setPage(1)
    }

    const handleClearFilter = () => {
        setMinPrice('')
        setMaxPrice('')
        setAppliedMin(undefined)
        setAppliedMax(undefined)
        setPage(1)
    }

    const toggleWishlist = (id, e) => {
        e.preventDefault()
        e.stopPropagation()
        setWishlist(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const hasActiveFilter = appliedMin !== undefined || appliedMax !== undefined
    const handleSearch = (e) => {
        e.preventDefault()
        setFilters((prev) => ({ ...prev, name: search }))
    }
    return (
        <div className="min-h-screen bg-[#f9f9f7] mt-32">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Danh sách sản phẩm
                        </h1>
                        {!isLoading && (
                            <p className="text-sm text-gray-400 mt-1">
                                {pagination.total ?? 0} sản phẩm
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilter(v => !v)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium cursor-pointer"
                        >
                            <SlidersHorizontal size={16} />
                            Lọc
                        </button>
                        <select
                            value={sort}
                            onChange={e => { setSort(e.target.value); setPage(1) }}
                            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium cursor-pointer outline-none"
                        >
                            {SORT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-8">
                    <aside className={`
                        w-64 flex-shrink-0 flex-col gap-6
                        ${showFilter ? 'flex' : 'hidden lg:flex'}
                    `}>
                        <div className="bg-white rounded-2xl p-6 sticky top-8">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-gray-900 text-base">Bộ lọc</h3>
                                {hasActiveFilter && (
                                    <button
                                        onClick={handleClearFilter}
                                        className="text-xs text-red-500 flex items-center gap-1 cursor-pointer hover:underline"
                                    >
                                        <X size={12} /> Xóa lọc
                                    </button>
                                )}
                            </div>
                            <div>
                                <form className='flex items-center gap-1' onSubmit={handleSearch}>
                                    <input
                                        type="text"
                                        placeholder="nhập tên"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black transition-colors"
                                    />
                                    <button className="bg-primary text-secondary p-2 rounded-lg " type='submit'>
                                        Tìm
                                    </button>
                                </form>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-3">Khoảng giá</p>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="number"
                                        placeholder="Giá từ"
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black transition-colors"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Giá đến"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black transition-colors"
                                    />
                                    <button
                                        onClick={handleApplyFilter}
                                        className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer mt-1"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {[
                                        { label: 'Dưới 200k', min: undefined, max: 200000 },
                                        { label: '200k–500k', min: 200000, max: 500000 },
                                        { label: 'Trên 500k', min: 500000, max: undefined },
                                    ].map(tag => (
                                        <button
                                            key={tag.label}
                                            onClick={() => {
                                                setMinPrice(tag.min ?? '')
                                                setMaxPrice(tag.max ?? '')
                                                setAppliedMin(tag.min)
                                                setAppliedMax(tag.max)
                                                setPage(1)
                                            }}
                                            className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-gray-50 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer"
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-5">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Màu sắc</p>

                                    <div className="flex flex-wrap gap-3">
                                        {COLORS.map(c => {
                                            const active = filters.color === c.value

                                            return (
                                                <button
                                                    key={c.value}
                                                    onClick={() =>
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            color: prev.color === c.value ? '' : c.value
                                                        }))
                                                    }
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition
                        ${active ? 'border-black scale-110' : 'border-gray-300'}
                    `}
                                                    style={{ backgroundColor: c.hex }}
                                                    title={c.label}
                                                >
                                                    {active && (
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Kích thước</p>

                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map(s => {
                                            const active = filters.size === s

                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() =>
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            size: prev.size === s ? '' : s
                                                        }))
                                                    }
                                                    className={`px-3 py-1 rounded-full text-sm border transition
                        ${active
                                                            ? 'bg-black text-white border-black'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                                        }
                    `}
                                                >
                                                    {s}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-3">Trạng thái</p>
                                <div className="flex flex-col gap-2">
                                    {FILTERS.map(item => (
                                        <label
                                            key={item.key}
                                            className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={filters[item.key]}
                                                onChange={(e) =>
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        [item.key]: e.target.checked
                                                    }))
                                                }
                                            />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array(9).fill(0).map((_, i) => (
                                    <div key={i} className="rounded-2xl bg-white overflow-hidden animate-pulse">
                                        <div className="h-64 bg-gray-200" />
                                        <div className="p-4 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : productList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                                <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
                                <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productList.map(product => {
                                    const thumbnail = product.productImages.find((thum) => thum.isMain)
                                    const discountPercent = Math.min(...product.variants.map(v => v.discountPercent));
                                    const minPrice = Math.min(...product.variants.map(v => Number(v.price)));
                                    const minBasePrice = Math.min(...product.variants.map(v => Number(v.price)));
                                    const isWished = !!wishlist[product.id]

                                    return (
                                        <Link
                                            to={`/product/${product.id}-${product.slug}`}
                                            key={product.id}
                                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 block"
                                        >
                                            <div className="relative h-64 overflow-hidden bg-gray-50">
                                                <img
                                                    src={thumbnail.thumbnail}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <button
                                                    onClick={(e) => toggleWishlist(product.id, e)}
                                                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all cursor-pointer
                                                        group-hover:opacity-100 opacity-0
                                                        ${isWished ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                                                >
                                                    <Heart size={15} fill={isWished ? 'currentColor' : 'none'} />
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-1">
                                                <p className="text-xs text-gray-400 font-medium mb-1">{product.brand?.name}</p>
                                                <p className="font-semibold text-gray-900 line-clamp-1 text-sm">{product.name}</p>

                                                <div className='flex items-center gap-3'>
                                                    <p className='font-semibold text-red-500'>
                                                        {fmt(minPrice ?? minBasePrice)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-9 h-9 rounded-xl border border-gray-300 bg-white flex items-center justify-center hover:border-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {visiblePages.map((item) => (
                                    typeof item === "string" ? (
                                        <span
                                            key={item}
                                            className="px-1 text-sm text-gray-400"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setPage(item)}
                                            className={`w-9 h-9 rounded-xl border text-sm font-semibold transition-all cursor-pointer
                                            ${page === item
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-9 h-9 rounded-xl border border-gray-300 bg-white flex items-center justify-center hover:border-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
