import React, { useMemo, useState } from "react"

import { useSearchParams } from "react-router-dom"
import { Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"

import { useOrders } from "@/hooks/order/useOrder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { fmt } from "@/lib/convertMoney"
import { orderStore } from "@/stores/order.store"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pencil } from "lucide-react"
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
const LIMIT_OPTIONS = ["10", "20", "50"]
const getStatusBadge = (status) => {
    const map = {
        PENDING: "bg-amber-50 text-amber-700 border-amber-200",
        CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
        SHIPPING: "bg-indigo-50 text-indigo-700 border-indigo-200",
        DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        CANCELLED: "bg-red-50 text-red-600 border-red-200",
    }

    const labelMap = {
        PENDING: "Chờ xử lý",
        CONFIRMED: "Đã xác nhận",
        SHIPPING: "Đang giao",
        DELIVERED: "Đã giao",
        CANCELLED: "Đã hủy",
    }

    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${map[status] || ""}`}>
            {labelMap[status] || status}
        </span>
    )
}

const getPaymentBadge = (status) => {
    const map = {
        UNPAID: "bg-slate-100 text-slate-700 border-slate-200",
        PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
        FAILED: "bg-red-50 text-red-600 border-red-200",
        REFUNDED: "bg-violet-50 text-violet-700 border-violet-200",
    }

    const labelMap = {
        UNPAID: "Chưa thanh toán",
        PAID: "Đã thanh toán",
        FAILED: "Thất bại",
        REFUNDED: "Hoàn tiền",
    }

    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${map[status] || ""}`}>
            {labelMap[status] || status}
        </span>
    )
}

export const OrderPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const { update } = orderStore()
    const [nextStatus, setNextStatus] = useState("")
    const [orderInfo, setOrderInfo] = useState(null)
    const [searchName, setSearchName] = useState(searchParams.get("name") || "")
    const [searchOrderCode, setSearchOrderCode] = useState(searchParams.get("orderCode") || "")
    const [status, setStatus] = useState(false)
    const filter = useMemo(() => ({
        limit: Number(searchParams.get("limit") || 10),
        page: Number(searchParams.get("page") || 1),
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        name: searchParams.get("name") || undefined,
        orderCode: searchParams.get("orderCode") || undefined,
        paymentStatus: searchParams.get("paymentStatus") || undefined,
        sort: searchParams.get("sort") || "newest",
        status: searchParams.get("status") || undefined,
    }), [searchParams])

    const { orders, isLoading, isValidating, refreshOrders } = useOrders(filter)

    const data = orders?.orders || []
    const pagination = orders?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
    const visiblePages = useMemo(() => {
        const totalPage = pagination.totalPages || 1
        const currentPage = pagination.page || 1

        if (totalPage <= 7) {
            return Array.from({ length: totalPage }, (_, index) => index + 1)
        }

        const pages = new Set([1, totalPage, currentPage, currentPage - 1, currentPage + 1])

        if (currentPage <= 3) {
            pages.add(2)
            pages.add(3)
            pages.add(4)
        }

        if (currentPage >= totalPage - 2) {
            pages.add(totalPage - 1)
            pages.add(totalPage - 2)
            pages.add(totalPage - 3)
        }

        const sortedPages = [...pages]
            .filter((page) => page >= 1 && page <= totalPage)
            .sort((a, b) => a - b)

        const result = []

        for (let index = 0; index < sortedPages.length; index += 1) {
            const page = sortedPages[index]
            const previousPage = sortedPages[index - 1]

            if (index > 0 && page - previousPage > 1) {
                result.push(`ellipsis-${previousPage}-${page}`)
            }

            result.push(page)
        }

        return result
    }, [pagination.page, pagination.totalPages])
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

    const onPageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return
        updateParams({ page })
    }

    const totalRevenue = data
        .filter((item) => item.paymentStatus === "PAID" && item.status !== "CANCELLED")
        .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
    const paidOrders = data.filter((item) => item.paymentStatus === "PAID").length
    const cancelledOrders = data.filter((item) => item.status === "CANCELLED").length
    const handleUpdateStatus = (item) => {
        setStatus(true)
        setOrderInfo(item)
    }
    const handleChangeStatus = async (newStatus) => {
        if (!newStatus || !orderInfo.id) return
        try {
            const res = await update(orderInfo.id, { status: nextStatus })
            toast.success("Cập nhật trạng thái đơn hàng thành công")
            setStatus(false)
            refreshOrders()
        } catch (error) {
            toast.error("Lỗi")
        }
    }
    return (
        <div className="space-y-6 max-w-screen-xl">
            <AlertDialog open={status} onOpenChange={setStatus}>
                <AlertDialogContent className="bg-secondary rounded-xl overflow-visible">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cập nhật</AlertDialogTitle>
                        <AlertDialogDescription>
                            Chọn trạng thái mới cho đơn hàng của {orderInfo?.receiverName}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <Select value={nextStatus} onValueChange={setNextStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>

                            <SelectContent className="z-[100] bg-secondary">
                                <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                                <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleChangeStatus(nextStatus)}
                            disabled={!nextStatus}
                        >
                            Cập nhật
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Quản lý đơn hàng</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Theo dõi trạng thái đơn hàng, thanh toán và thông tin người nhận
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refreshOrders()}
                    disabled={isValidating}
                >
                    Làm mới
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Tổng đơn hiện tại</p>
                    <p className="mt-2 text-2xl font-semibold">{pagination.total}</p>
                </div>
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Đơn đã thanh toán trong trang</p>
                    <p className="mt-2 text-2xl font-semibold">{paidOrders}</p>
                </div>
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Tổng doanh thu trong trang</p>
                    <p className="mt-2 text-2xl font-semibold">{fmt(totalRevenue)}</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="rounded-xl border p-4 space-y-4 max-w-full">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Tên người nhận, tỉnh, sản phẩm..."
                            className="pl-9 border border-primary"
                        />
                    </div>

                    <Input
                        value={searchOrderCode}
                        onChange={(e) => setSearchOrderCode(e.target.value)}
                        placeholder="Mã đơn hàng"
                        className="border border-primary"
                    />

                    <Input
                        type="number"
                        placeholder="Giá tối thiểu"
                        defaultValue={searchParams.get("minPrice") || ""}
                        onBlur={(e) => updateParams({ minPrice: e.target.value || undefined, page: 1 })}
                        className="border border-primary"
                    />

                    <Input
                        type="number"
                        placeholder="Giá tối đa"
                        defaultValue={searchParams.get("maxPrice") || ""}
                        onBlur={(e) => updateParams({ maxPrice: e.target.value || undefined, page: 1 })}
                        className="border border-primary"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Select
                        value={searchParams.get("status") || "ALL"}
                        onValueChange={(value) => updateParams({ status: value, page: 1 })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Trạng thái đơn" />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary z-[9999]">
                            {STATUS_OPTIONS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={searchParams.get("paymentStatus") || "ALL"}
                        onValueChange={(value) => updateParams({ paymentStatus: value, page: 1 })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Thanh toán" />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary z-[9999]">
                            {PAYMENT_STATUS_OPTIONS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={searchParams.get("sort") || "newest"}
                        onValueChange={(value) => updateParams({ sort: value, page: 1 })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary z-[9999]">
                            {SORT_OPTIONS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={searchParams.get("limit") || "10"}
                        onValueChange={(value) => updateParams({ limit: value, page: 1 })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Số dòng" />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary z-[9999]">
                            {LIMIT_OPTIONS.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item} / trang
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button type="submit" className="text-secondary flex-1">
                            Tìm kiếm
                        </Button>
                        <Button type="button" variant="outline" onClick={handleReset}>
                            <RotateCcw size={16} />
                        </Button>
                    </div>
                </div>
            </form>

            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Đơn hàng</TableHead>
                            <TableHead>Người nhận</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Thanh toán</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                                    Không có đơn hàng phù hợp
                                </TableCell>
                            </TableRow>
                        ) : data.map((order) => (
                            <TableRow key={order.id} className="align-top">
                                <TableCell className="min-w-[180px]">
                                    <div className="space-y-2">
                                        <p className="font-semibold">{order.orderCode}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{order.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Thanh toán khi nhận hàng"}</Badge>
                                            {order.note ? <Badge variant="secondary">Có ghi chú</Badge> : null}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="min-w-[220px]">
                                    <div className="space-y-1">
                                        <p className="font-medium">{order.receiverName}</p>
                                        <p className="text-sm text-muted-foreground">{order.receiverPhone}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.addressLine}, {order.ward}, {order.province}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell className="min-w-[320px]">
                                    <div className="space-y-2">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex gap-3 rounded-lg border p-2">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="h-14 w-14 rounded-md object-cover border"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-2 text-sm font-medium">
                                                        {item.productName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Màu: {item.color || "—"} | Size: {item.size || "—"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        SL: {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-semibold mt-1">
                                                        {fmt(item.finalPrice)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>

                                <TableCell className="min-w-[170px]">
                                    <div className="space-y-2">
                                        <div>{getPaymentBadge(order.paymentStatus)}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Thanh toán lúc: {formatDate(order.paidAt)}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell className="min-w-[180px]">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-base">
                                            {fmt(order.totalAmount)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Tạm tính: {fmt(order.subtotal)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Giảm giá: {fmt(order.discountAmount)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Ship: {fmt(order.shippingFee)}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell className="min-w-[150px]">
                                    <div className="space-y-2">
                                        <div>{getStatusBadge(order.status)}</div>
                                        {order.status === "CANCELLED" && order.cancelledAt ? (
                                            <p className="text-xs text-red-500">
                                                Hủy lúc: {formatDate(order.cancelledAt)}
                                            </p>
                                        ) : null}
                                        {order.deliveredAt ? (
                                            <p className="text-xs text-emerald-600">
                                                Giao lúc: {formatDate(order.deliveredAt)}
                                            </p>
                                        ) : null}
                                    </div>
                                </TableCell>

                                <TableCell className="min-w-[140px] text-sm text-muted-foreground">
                                    <div className="space-y-1">
                                        <p>{formatDate(order.createdAt)}</p>
                                        <p>Cập nhật: {formatDate(order.updatedAt)}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost"
                                            onClick={() => handleUpdateStatus(order)}>
                                            <Pencil size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <span className="font-medium text-foreground">
                        {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                    </span>
                    {" - "}
                    <span className="font-medium text-foreground">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {" / "}
                    <span className="font-medium text-foreground">{pagination.total}</span> người dùng
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    {visiblePages.map((page) => (
                        typeof page === "string" ? (
                            <span key={page} className="px-2 text-sm text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                size="sm"
                                variant={page === pagination.page ? "default" : "outline"}
                                className={page === pagination.page ? "text-secondary" : ""}
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                        )
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPage}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            {cancelledOrders > 0 ? (
                <p className="text-sm text-muted-foreground">
                    Có <span className="font-semibold text-red-500">{cancelledOrders}</span> đơn bị hủy trong danh sách hiện tại.
                </p>
            ) : null}
        </div>
    )
}
