import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { CategoryForm } from "./CategoryForm"
import { toast } from "sonner"
import { useSearchParams, Link } from "react-router-dom"
import { useCategoryList, useGetCategory } from "@/hooks/category/useCategory"
import { categoryStore } from "@/stores/category.store"
import { formatDate } from "@/lib/formatDate"

export const CategoryPage = () => {
    const { delete: deleteCategory } = categoryStore()
    const [searchParams] = useSearchParams()
    const parentId = searchParams.get("parentId") || undefined

    const [selectedL1, setSelectedL1] = useState(undefined)
    const [selectedL2, setSelectedL2] = useState(undefined)
    const [remove, setRemove] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [params, setParams] = useState({ page: 1, limit: 10, parentId })
    const [modal, setModal] = useState({ open: false, mode: "add", data: null })

    const { categoriesTree } = useGetCategory()
    const { data, pagination, isLoading, refresh } = useCategoryList(params)
    console.log(data, "datadatadata")
    const allCats = categoriesTree || []
    const level2Options = selectedL1
        ? allCats.find(c => c.id === selectedL1)?.children || []
        : []
    const level3Options = selectedL2
        ? level2Options.find(c => c.id === selectedL2)?.children || []
        : []
    const breadcrumbL1 = allCats.find(c => c.id === selectedL1)
    const breadcrumbL2 = level2Options.find(c => c.id === selectedL2)
    useEffect(() => {
        if (parentId) {
            const foundL2 = allCats.flatMap(c => c.children).find(c => c.id === parentId)
            if (foundL2) {
                setSelectedL1(foundL2.parentId)
                setSelectedL2(foundL2.id)
            }
        } else {
            setSelectedL1(undefined)
            setSelectedL2(undefined)
        }
        setParams(p => ({ ...p, page: 1, parentId }))
    }, [parentId, allCats.length])

    const handleDelete = (item) => {
        setSelectedItem(item)
        setRemove(true)
    }

    const handleRemove = async () => {
        try {
            await deleteCategory(selectedItem.id)
            toast.success("Đã xóa danh mục")
            setRemove(false)
            setSelectedItem(null)
            refresh()
        } catch (e) {
            toast.error(e?.response?.data?.message || "Xóa thất bại")
        }
    }

    const getLevelBadge = (level) => {
        const map = {
            1: { label: "Cấp 1", variant: "default" },
            2: { label: "Cấp 2", variant: "secondary" },
            3: { label: "Cấp 3", variant: "outline" },
        }
        const { label, variant } = map[level] || {}
        return <Badge variant={variant}>{label}</Badge>
    }

    return (
        <div className="p-6 space-y-4">
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
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link to="/admin/category" className="hover:text-foreground transition-colors">
                    Danh mục
                </Link>
                {breadcrumbL1 && (
                    <>
                        <span>/</span>
                        <span className={!breadcrumbL2 ? "text-foreground font-medium" : ""}>
                            {breadcrumbL1.name}
                        </span>
                    </>
                )}
                {breadcrumbL2 && (
                    <>
                        <span>/</span>
                        <span className="text-foreground font-medium">{breadcrumbL2.name}</span>
                    </>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {breadcrumbL2?.name || breadcrumbL1?.name || "Tất cả danh mục"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {breadcrumbL2
                            ? `Danh mục cấp 3 thuộc "${breadcrumbL2.name}"`
                            : breadcrumbL1
                                ? `Danh mục cấp 2 thuộc "${breadcrumbL1.name}"`
                                : "Quản lý toàn bộ danh mục"
                        }
                    </p>
                </div>
                <Button onClick={() => setModal({ open: true, mode: "add", data: null })} className="text-secondary">
                    <Plus size={16} />
                    Thêm danh mục
                </Button>

            </div>
            <div className="flex gap-3 flex-wrap">
                <Select
                    value={selectedL1 || "all"}
                    onValueChange={(v) => {
                        const val = v === "all" ? undefined : v
                        setSelectedL1(val)
                        setSelectedL2(undefined)
                        setParams(p => ({ ...p, page: 1, parentId: val }))
                    }}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Cấp 1" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-secondary">
                        <SelectItem value="all">Tất cả cấp 1</SelectItem>
                        {allCats.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedL1 && (
                    <Select
                        value={selectedL2 || "all"}
                        onValueChange={(v) => {
                            const val = v === "all" ? undefined : v
                            setSelectedL2(val)
                            setParams(p => ({ ...p, page: 1, parentId: val ?? selectedL1 }))
                        }}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Cấp 2" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] bg-secondary">
                            <SelectItem value="all">Tất cả cấp 2</SelectItem>
                            {level2Options.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {selectedL2 && level3Options.length > 0 && (
                    <Select
                        value={params.parentId || "all"}
                        onValueChange={(v) => {
                            setParams(p => ({ ...p, page: 1, parentId: v === "all" ? selectedL2 : v }))
                        }}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Cấp 3" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="all">Tất cả cấp 3</SelectItem>
                            {level3Options.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Select
                    value={String(params.limit)}
                    onValueChange={(v) => setParams(p => ({ ...p, limit: Number(v), page: 1 }))}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                        {[10, 20, 50].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} / trang</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="border rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên danh mục</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Cấp</TableHead>
                            <TableHead>Ảnh</TableHead>
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
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : data.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">{item.slug}</TableCell>
                                <TableCell>{getLevelBadge(item.level)}</TableCell>
                                <TableCell>
                                    {item.thumbnail
                                        ? <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
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
            </div>
            {pagination.totalPage >= 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Trang {pagination.page} / {pagination.totalPage} — {pagination.total} danh mục
                    </span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="outline"
                            disabled={pagination.page <= 1}
                            onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}>
                            <ChevronLeft size={14} />
                        </Button>
                        {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map(p => (
                            <Button key={p} size="sm" className="text-secondary"
                                variant={p === pagination.page ? "default" : "outline"}
                                onClick={() => setParams(prev => ({ ...prev, page: p }))}>
                                {p}
                            </Button>
                        ))}
                        <Button size="sm" variant="outline"
                            disabled={pagination.page >= pagination.totalPage}
                            onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}>
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}
            <Dialog open={modal.open} onOpenChange={(o) => !o && setModal(m => ({ ...m, open: false }))}>
                <DialogContent className="max-w-lg bg-secondary rounded-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {modal.mode === "add" ? "Thêm danh mục" : "Sửa danh mục"}
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        mode={modal.mode}
                        initialData={modal.data}
                        allCategories={allCats}
                        onSuccess={() => {
                            setModal(m => ({ ...m, open: false }))
                            refresh()
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}