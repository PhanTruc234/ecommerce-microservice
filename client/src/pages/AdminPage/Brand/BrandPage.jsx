import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useBrand } from '@/hooks/brand/useBrand'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { BrandForm } from './BrandForm'
import { brandStore } from '@/stores/brand.store'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { formatDate } from '@/lib/formatDate'

export const BrandPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("search") || "")
    const filter = {
        page: Number(searchParams.get("page") || 1),
        limit: Number(searchParams.get("limit") || 10),
        search: searchParams.get("search") || ""
    }
    const { brands: data, isLoading, isValidating, refreshBrands } = useBrand(filter)
    const { remove: removeBrand } = brandStore()
    const [remove, setRemove] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [modal, setModal] = useState({ open: false, data: null, mode: "add" })
    const handleRemove = async () => {
        try {
            await removeBrand(selectedItem.id)
            setRemove(false)
            setSelectedItem(null)
            refreshBrands()
            toast.success("Xóa thương hiệu thành công")
        } catch (error) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra")
        }
    }
    const handleDelete = (item) => {
        setSelectedItem(item)
        setRemove(true)
    }
    const handleSearch = (e) => {
        e.preventDefault()
        const newParams = new URLSearchParams()
        newParams.set("page", "1")
        newParams.set("limit", "10")
        if (search.trim()) {
            newParams.set("search", search.trim())
        } else {
            newParams.delete("search")
        }
        setSearchParams(newParams)
    }
    return (
        <div className='space-y-6'>
            <AlertDialog open={remove} onOpenChange={setRemove}>
                <AlertDialogContent className="bg-secondary rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có muốn xóa <span className="font-semibold text-foreground">"{selectedItem?.name}"</span> không?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleRemove}>
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className='flex items-center justify-between'>
                <h1 className="text-2xl font-semibold">
                    Thương hiệu
                </h1>
                <Button onClick={() => setModal({ open: true, mode: "add", data: null })} className="text-secondary">
                    <Plus size={16} />
                    Thêm thương hiệu
                </Button>
            </div>
            <form className='flex justify-between items-center'>
                <div className='relative flex items-center gap-2'>
                    <div>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Tìm kiếm thương hiệu...' id='search' className='border pl-10 py-3 min-w-[384px] ' />
                        <label htmlFor="search" className='absolute top-1/2 -translate-y-1/2 left-3 cursor-pointer'>
                            <Search size={20} />
                        </label>
                    </div>
                    <Button className="text-secondary py-6 px-6" onClick={handleSearch}>
                        Tìm
                    </Button>
                </div>
                <Select
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Mới nhất" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-secondary">
                        <SelectItem value="new">Mới nhất</SelectItem>
                        <SelectItem value="old">Cũ nhất</SelectItem>
                    </SelectContent>
                </Select>
            </form>
            <div className="border rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên thương hiệu</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Logo</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Ngày cập nhật</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : data?.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">{item.slug}</TableCell>
                                <TableCell>
                                    {item.thumbnail
                                        ? <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        : <span className="text-xs text-muted-foreground">—</span>
                                    }
                                </TableCell>
                                <TableCell>
                                    {item.description
                                        ? item.description
                                        : <span className="text-xs text-muted-foreground">—</span>
                                    }
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {formatDate(item.createdAt)}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {item.updatedAt ? formatDate(item.updatedAt) : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost"
                                            onClick={() => setModal({ open: true, mode: "edit", data: item })}>
                                            <Pencil size={14} />
                                        </Button>
                                        <Button size="sm" variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(item)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Dialog open={modal.open} onOpenChange={(o) => !o && setModal(m => ({ ...m, open: false }))}>
                    <DialogContent className="max-w-lg bg-secondary rounded-lg [&>button]:hidden">
                        <DialogHeader>
                            <DialogTitle>
                                {modal.mode === "add" ? "Thêm thương hiệu" : "Sửa thương hiệu"}
                            </DialogTitle>
                        </DialogHeader>
                        <BrandForm mode={modal.mode} open={modal.open} initialData={modal.data} onSuccess={() => {
                            setModal(m => ({ ...m, open: false }))
                            refreshBrands()
                        }} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
