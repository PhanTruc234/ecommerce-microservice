import { useMemo, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Package,
    Receipt,
    RotateCcw,
    ShoppingBag,
    Wallet,
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useMyOrders } from "@/hooks/order/useOrder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fmt } from "@/lib/convertMoney"
import { orderStore } from "@/stores/order.store"
import { toast } from "sonner"
import { formatDate } from "@/lib/formatDate"
const STATUS_OPTIONS = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "DELIVERED", label: "Đã giao" },
    { value: "CANCELLED", label: "Đã hủy" },
]
const PAYMENT_STATUS_OPTIONS = [
    { value: "ALL", label: "Tất cả thanh toán" },
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "FAILED", label: "Thất bại" },
    { value: "REFUNDED", label: "Hoàn tiền" },
]

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "price_asc", label: "Tổng tiền tăng dần" },
    { value: "price_desc", label: "Tổng tiền giảm dần" },
]

const getStatusMeta = (status) => {
    const map = {
        PENDING: {
            label: "Chờ xử lý",
            className:
                "border-yellow-200 bg-yellow-50 text-yellow-700",
        },
        PROCESSING: {
            label: "Đang xử lý",
            className:
                "border-amber-200 bg-amber-50 text-amber-700",
        },
        CONFIRMED: {
            label: "Đã xác nhận",
            className:
                "border-blue-200 bg-blue-50 text-blue-700",
        },

        SHIPPING: {
            label: "Đang giao",
            className:
                "border-indigo-200 bg-indigo-50 text-indigo-700",
        },
        DELIVERED: {
            label: "Đã giao",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700",
        },

        CANCELLED: {
            label: "Đã hủy",
            className:
                "border-red-200 bg-red-50 text-red-700",
        },
    };
    return map[status] || {
        label: status || "Không rõ",
        className:
            "border-zinc-200 bg-zinc-100 text-zinc-700",
    };
}

const getPaymentMeta = (status) => {
    const map = {
        UNPAID: {
            label: "Chưa thanh toán",
            className:
                "border-yellow-200 bg-yellow-50 text-yellow-700",
        },
        PAID: {
            label: "Đã thanh toán",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700",
        },

        FAILED: {
            label: "Thất bại",
            className:
                "border-red-200 bg-red-50 text-red-700",
        },
        REFUNDED: {
            label: "Hoàn tiền",
            className:
                "border-blue-200 bg-blue-50 text-blue-700",
        },
    };
    return map[status] || {
        label: status || "Không rõ",
        className: "border-slate-200 bg-slate-100 text-slate-700",
    }
}
const getPaymentMethodLabel = (method) => {
    if (method === "BANK_TRANSFER") return "Chuyển khoản"
    if (method === "COD") return "Thanh toán khi nhận hàng"
    return method || "Không rõ"
}
const SummaryCard = ({ icon, label, value, hint }) => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
                <p className="mt-2 text-sm text-slate-500">{hint}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                {icon}
            </div>
        </div>
    </div>
)
export const MyOrderPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchName, setSearchName] = useState(searchParams.get("name") || "")
    const [searchOrderCode, setSearchOrderCode] = useState(searchParams.get("orderCode") || "")
    const [status, setStatus] = useState(false)
    const [orderInfo, setOrderInfo] = useState(null)
    const { update } = orderStore()
    const [page, setPage] = useState(1)
    const filter = useMemo(() => ({
        limit: Number(searchParams.get("limit") || 2),
        page: Number(searchParams.get("page") || 1),
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        name: searchParams.get("name") || undefined,
        orderCode: searchParams.get("orderCode") || undefined,
        paymentStatus: searchParams.get("paymentStatus") || undefined,
        sort: searchParams.get("sort") || "newest",
        status: searchParams.get("status") || undefined,
    }), [searchParams])
    const { myOrders, isLoading, isValidating, refreshMyOrders } = useMyOrders(filter)




    const data = myOrders?.orders || []
    const pagination = myOrders?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }




    const updateParams = (updates) => {
        const next = new URLSearchParams(searchParams)




        Object.entries(updates).forEach(([key, value]) => {
            const isEmpty =
                value === undefined ||
                value === null ||
                value === "" ||
                value === "ALL"




            if (isEmpty) {
                next.delete(key)
            } else {
                next.set(key, String(value))
            }
        })




        setSearchParams(next)
    }




    const handleSearch = (e) => {
        e.preventDefault()
        updateParams({
            page: 1,
            name: searchName.trim() || undefined,
            orderCode: searchOrderCode.trim() || undefined,
        })
    }




    const handleReset = () => {
        setSearchName("")
        setSearchOrderCode("")
        setSearchParams({
            page: "1",
            limit: "10",
            sort: "newest",
        })
    }
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




    const totalValue = data.reduce((acc, cur) => acc + Number(cur.totalAmount || 0), 0)
    const paidOrders = data.filter((item) => item.paymentStatus === "PAID").length
    const cancelledOrders = data.filter((item) => item.status === "CANCELLED").length
    const handleCancel = (item) => {
        setStatus(true)
        setOrderInfo(item)
    }
    const handleChangeStatus = async (newStatus) => {
        if (!newStatus || !orderInfo.id) return
        try {
            await update(orderInfo.id, { status: newStatus })
            toast.success("Cập nhật trạng thái đơn hàng thành công")
            setStatus(false)
            refreshMyOrders()
        } catch {
            toast.error("Lỗi")
        }
    }
    return (
        <section className="mt-32 min-h-screen bg-white pb-16">
            <AlertDialog open={status} onOpenChange={setStatus}>
                <AlertDialogContent className="rounded-[24px] border border-slate-200 bg-white p-0 overflow-hidden">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hủy đơn hàng</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Bạn có chắc muốn hủy đơn này không? Kiểm tra thông tin đơn hàng bên dưới trước khi xác nhận.
                    </AlertDialogDescription>
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Mã đơn</span>
                            <span className="font-semibold text-slate-900">{orderInfo?.orderCode || "Không rõ"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Người nhận</span>
                            <span className="font-semibold text-slate-900">{orderInfo?.receiverName || "Không rõ"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Số điện thoại</span>
                            <span className="font-semibold text-slate-900">{orderInfo?.receiverPhone || "Không rõ"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Thanh toán</span>
                            <span className="font-semibold text-slate-900">{getPaymentMethodLabel(orderInfo?.paymentMethod)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Tổng tiền</span>
                            <span className="font-semibold text-slate-900">{fmt(orderInfo?.totalAmount || 0)}</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-500">Địa chỉ</span>
                            <span className="max-w-[70%] text-right font-semibold text-slate-900">
                                {[orderInfo?.addressLine, orderInfo?.ward, orderInfo?.province].filter(Boolean).join(", ") || "Chưa cập nhật"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Ngày tạo</span>
                            <span className="font-semibold text-slate-900">{formatDate(orderInfo?.createdAt)}</span>
                        </div>
                        <div className="space-y-3 border-t border-slate-200 pt-3">
                            <p className="text-slate-500">Sản phẩm</p>
                            {orderInfo?.items?.length ? (
                                orderInfo.items.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                                    >
                                        <div className="h-14 w-14 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 font-semibold text-slate-900">
                                                {product.productName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                SL: {product.quantity} | Size: {product.size || "Không rõ"} | Màu: {product.color || "Không rõ"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">Không có sản phẩm trong đơn.</p>
                            )}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-slate-950 hover:bg-black text-white"
                            onClick={() => handleChangeStatus("CANCELLED")}
                        >
                            Hủy đơn hàng
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="container">
                <div className="rounded-[36px] border border-slate-200 bg-blues-500 px-6 py-8 text-white sm:px-8 lg:px-10">
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                                Đơn hàng của bạn
                            </h1>
                            <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
                                Xem nhanh tiến độ giao hàng, thanh toán và chi tiết từng sản phẩm trong mỗi đơn.
                            </p>
                        </div>




                        <div className="flex flex-wrap gap-3">
                            <Button
                                className="rounded-full border border-white bg-transparent text-secondary hover:bg-secondary hover:text-primary"
                                onClick={() => refreshMyOrders()}
                                disabled={isValidating}
                            >
                                Làm mới
                            </Button>
                            <Button
                                asChild
                                className="rounded-full border  border-white bg-transparent text-white hover:bg-white hover:text-slate-950"
                            >
                                <Link to="/product">Mua sắm tiếp</Link>
                            </Button>
                        </div>
                    </div>
                </div>




                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    <SummaryCard
                        icon={<ShoppingBag size={22} className="text-white" />}
                        label="Tổng đơn trong trang"
                        value={pagination.total}
                        hint="Số lượng đơn hàng đang hiển thị theo bộ lọc hiện tại."
                    />
                    <SummaryCard
                        icon={<Wallet size={22} className="text-white" />}
                        label="Đã thanh toán"
                        value={paidOrders}
                        hint="Những đơn đã được xác nhận giao dịch thành công."
                    />
                    <SummaryCard
                        icon={<Receipt size={22} className="text-white" />}
                        label="Tổng chi tiêu trên trang"
                        value={fmt(totalValue)}
                        hint={cancelledOrders > 0 ? `${cancelledOrders} đơn đã hủy trong danh sách này.` : "Không có đơn hủy trong danh sách này."}
                    />
                </div>




                <form
                    onSubmit={handleSearch}
                    className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5"
                >
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                            <div className="relative">
                                <Input
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    placeholder="Tìm theo tên người nhận, sản phẩm..."
                                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-16 shadow-none focus-visible:ring-slate-300"
                                />
                            </div>




                            <Input
                                value={searchOrderCode}
                                onChange={(e) => setSearchOrderCode(e.target.value)}
                                placeholder="Nhập mã đơn hàng"
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-slate-300"
                            />




                            <Input
                                type="number"
                                placeholder="Giá tối thiểu"
                                defaultValue={searchParams.get("minPrice") || ""}
                                onBlur={(e) => updateParams({ minPrice: e.target.value || undefined, page: 1 })}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-slate-300"
                            />




                            <Input
                                type="number"
                                placeholder="Giá tối đa"
                                defaultValue={searchParams.get("maxPrice") || ""}
                                onBlur={(e) => updateParams({ maxPrice: e.target.value || undefined, page: 1 })}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-slate-300"
                            />
                        </div>




                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
                            <select
                                value={searchParams.get("status") || "ALL"}
                                onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                            >
                                <option value="ALL">Trạng thái đơn</option>
                                {STATUS_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>




                            <select
                                value={searchParams.get("paymentStatus") || "ALL"}
                                onChange={(e) => updateParams({ paymentStatus: e.target.value, page: 1 })}
                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                            >
                                <option value="ALL">Trạng thái thanh toán</option>
                                {PAYMENT_STATUS_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>




                            <select
                                value={searchParams.get("sort") || "newest"}
                                onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                            >
                                <option value="newest">Sắp xếp</option>
                                {SORT_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>




                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    className="h-12 flex-1 rounded-2xl bg-slate-950 text-white hover:bg-black"
                                >
                                    Tìm kiếm
                                </Button>




                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    className="h-12 rounded-2xl border-slate-200 px-4"
                                >
                                    <RotateCcw size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>




                <div className="mt-6 space-y-5">
                    {isLoading ? (
                        <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-700">
                            Đang tải đơn hàng...
                        </div>
                    ) : data.length === 0 ? (
                        <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-950 text-white">
                                <Package size={26} />
                            </div>
                            <h2 className="mt-5 text-xl font-semibold text-slate-900">
                                Chưa có đơn hàng phù hợp
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                Thử thay đổi bộ lọc hoặc tiếp tục mua sắm để tạo đơn hàng đầu tiên.
                            </p>
                            <Button asChild className="mt-6 rounded-full bg-slate-950 text-white hover:bg-black">
                                <Link to="/product">Xem sản phẩm</Link>
                            </Button>
                        </div>
                    ) : (
                        data.map((order) => {
                            const statusMeta = getStatusMeta(order.status)
                            const paymentMeta = getPaymentMeta(order.paymentStatus)




                            return (
                                <article
                                    key={order.id}
                                    className="overflow-hidden rounded-[32px] border border-slate-200 bg-white"
                                >
                                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-lg font-semibold ">{order.orderCode}</p>
                                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${paymentMeta.className}`}>
                                                        {paymentMeta.label}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Đặt ngày {formatDate(order.createdAt)} | Cập nhật {formatDate(order.updatedAt)}
                                                </p>
                                            </div>




                                            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        Người nhận
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">{order.receiverName}</p>
                                                    <p className="mt-1 text-sm text-slate-500">{order.receiverPhone}</p>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        Thanh toán
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                                        {getPaymentMethodLabel(order.paymentMethod)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {order.paidAt ? `Lúc ${formatDate(order.paidAt)}` : "Chưa ghi nhận thanh toán"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>




                                    <div className="px-5 py-5 sm:px-6">
                                        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
                                            <div className="space-y-3">
                                                {order.items?.map((item) => (
                                                    <div key={item.id}>
                                                        <div
                                                            className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row"
                                                        >
                                                            <div className="h-24 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.productName}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>




                                                            <div className="min-w-0 flex-1">
                                                                <p className="line-clamp-2 text-base font-semibold text-slate-900">
                                                                    {item.productName}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                                                                        Màu: {item.color || "Không rõ"}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                                                                        Size: {item.size || "Không rõ"}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                                                                        SL: {item.quantity}
                                                                    </Badge>
                                                                </div>
                                                                <p className="mt-3 text-sm text-slate-500">
                                                                    Đơn giá: <span className="font-semibold text-slate-900">{fmt(item.finalPrice)}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end mt-2">
                                                            {order.status !== "DELIVERED" ? (
                                                                <Button
                                                                    type="button"
                                                                    className="rounded-full border border-slate-950 bg-white text-slate-950 hover:bg-slate-950 hover:text-white"
                                                                    onClick={() => handleCancel(order)}
                                                                >
                                                                    Hủy đơn hàng
                                                                </Button>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>




                                            <aside className="space-y-4">
                                                <div className="rounded-[24px] border border-slate-950 bg-slate-950 p-5 text-white">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                        Tổng thanh toán
                                                    </p>
                                                    <p className="mt-3 text-3xl font-semibold">{fmt(order.totalAmount)}</p>
                                                    <div className="mt-5 space-y-2 text-sm text-slate-200">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Tạm tính</span>
                                                            <span>{fmt(order.subtotal)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Giảm giá</span>
                                                            <span>{fmt(order.discountAmount)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Vận chuyển</span>
                                                            <span>{fmt(order.shippingFee)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        Địa chỉ giao hàng
                                                    </p>
                                                    <p className="mt-3 text-sm leading-6 text-slate-700">
                                                        {[order.addressLine, order.ward, order.province].filter(Boolean).join(", ") || "Chưa cập nhật"}
                                                    </p>
                                                    {order.note ? (
                                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                                            Ghi chú: {order.note}
                                                        </div>
                                                    ) : null}
                                                    {order.deliveredAt ? (
                                                        <p className="mt-4 text-sm font-medium text-slate-700">
                                                            Giao thành công lúc {formatDate(order.deliveredAt)}
                                                        </p>
                                                    ) : null}
                                                    {order.cancelledAt ? (
                                                        <p className="mt-2 text-sm font-medium text-slate-500">
                                                            Đơn đã hủy lúc {formatDate(order.cancelledAt)}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </aside>
                                        </div>
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>




                <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                        Hiển thị{" "}
                        <span className="font-semibold text-slate-900">
                            {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                        </span>
                        {" - "}
                        <span className="font-semibold text-slate-900">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>
                        {" / "}
                        <span className="font-semibold text-slate-900">{pagination.total}</span> đơn hàng
                    </div>




                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-200"
                            onClick={() => {
                                setPage(pagination.page - 1)
                                updateParams({ page: pagination.page - 1 })




                            }}
                            disabled={page <= 1}
                        >
                            <ChevronLeft size={14} />
                        </Button>




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
                                    onClick={() => {
                                        setPage(item)
                                        updateParams({ page: item })




                                    }}
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




                        <Button
                            variant="outline"
                            size="sm"
                            className=" border-slate-200"
                            onClick={() => {
                                setPage(pagination.page + 1)
                                updateParams({ page: pagination.page + 1 })
                            }}
                            disabled={page >= pagination.totalPages}
                        >
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
