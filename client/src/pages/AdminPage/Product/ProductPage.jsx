import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBrand } from "@/hooks/brand/useBrand";
import { useProducts } from "@/hooks/product/useProduct";
import { fmt } from "@/lib/convertMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { productStore } from "@/stores/product.store";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "price_asc", label: "Giá tăng dần" },
    { value: "price_desc", label: "Giá giảm dần" },
];

const ITEM_CLASS = "cursor-pointer hover:bg-grays-500";

export const ProductPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [modalRemove, setModalRemove] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const filter = {
        name: searchParams.get("search") || "",
        brandId: searchParams.get("brandId") || undefined,
        sort: searchParams.get("sortBy") || "newest",
        page: searchParams.get("page") || 1,
    };

    const isFormPage =
        location.pathname.includes("/add") ||
        location.pathname.includes("/edit");

    const { isLoading, products, refreshProducts } = useProducts(filter);
    const { brands } = useBrand();
    const { remove } = productStore();

    const data = products?.products ?? [];
    const pagination = products?.pagination;

    const visiblePages = useMemo(() => {
        const totalPages = pagination?.totalPages || 1;
        const currentPage = pagination?.page || 1;

        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

        if (currentPage <= 3) {
            pages.add(2);
            pages.add(3);
            pages.add(4);
        }

        if (currentPage >= totalPages - 2) {
            pages.add(totalPages - 1);
            pages.add(totalPages - 2);
            pages.add(totalPages - 3);
        }

        const sortedPages = [...pages]
            .filter(page => page >= 1 && page <= totalPages)
            .sort((a, b) => a - b);

        const result = [];

        for (let i = 0; i < sortedPages.length; i++) {
            const page = sortedPages[i];
            const prev = sortedPages[i - 1];

            if (i > 0 && page - prev > 1) {
                result.push(`ellipsis-${prev}-${page}`);
            }

            result.push(page);
        }

        return result;
    }, [pagination?.page, pagination?.totalPages]);

    const handleDelete = (item) => {
        setSelectedItem(item);
        setModalRemove(true);
    };

    const handleRemove = async () => {
        try {
            await remove(selectedItem.id);
            setModalRemove(false);
            setSelectedItem(null);
            await refreshProducts();
            toast.success("Xóa thành công");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa thất bại");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", "1");

        if (search.trim()) newParams.set("search", search.trim());
        else newParams.delete("search");

        setSearchParams(newParams);
    };

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", "1");

        if (!value || value === "ALL") {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }

        setSearchParams(newParams);
    };

    const onPageChange = (page) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", String(page));
        setSearchParams(newParams);
    };

    useEffect(() => {
        refreshProducts();
    }, []);

    return (
        <div className="space-y-6">
            {isFormPage ? (
                <Outlet />
            ) : (
                <>
                    <AlertDialog open={modalRemove} onOpenChange={setModalRemove}>
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

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold mr-auto">Sản phẩm</h1>
                        <Link to="add" className="text-secondary bg-primary flex p-2 items-center gap-1">
                            <Plus size={16} />
                            Thêm sản phẩm
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <form onSubmit={handleSearch} className="relative flex-1 min-w-[240px]">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm theo tên sản phẩm..."
                                className="pl-9 border border-primary"
                            />
                        </form>

                        <Select
                            value={searchParams.get("brandId") || "ALL"}
                            onValueChange={value => handleFilterChange("brandId", value)}
                        >
                            <SelectTrigger className="w-[180px] border border-primary">
                                <SelectValue placeholder="Thương hiệu" />
                            </SelectTrigger>
                            <SelectContent className="bg-secondary border border-primary">
                                <SelectItem value="ALL" className={ITEM_CLASS}>Tất cả thương hiệu</SelectItem>
                                {brands?.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id} className={ITEM_CLASS}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={searchParams.get("sortBy") || "newest"}
                            onValueChange={value => handleFilterChange("sortBy", value)}
                        >
                            <SelectTrigger className="w-[170px] border border-primary">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent className="bg-secondary border border-primary">
                                {SORT_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value} className={ITEM_CLASS}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead>Thương hiệu</TableHead>
                                    <TableHead>Biến thể</TableHead>
                                    <TableHead>Giá cơ bản</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>Ngày cập nhật</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            Đang tải...
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : data.map(item => {
                                    const mainImage = item.productImages?.find(img => img.isMain) ?? item.productImages?.[0];

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {mainImage?.thumbnail ? (
                                                        <img
                                                            src={mainImage.thumbnail}
                                                            alt={item.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg border bg-muted" />
                                                    )}
                                                    <div>
                                                        <p>{item.name}</p>
                                                        <p className="text-xs text-grays-700">Slug: {item.slug}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {item.categories?.map((cate, index) => (
                                                        <div key={cate.category.id} className="flex items-center gap-1">
                                                            <span className={cn(
                                                                "text-xs px-1.5 py-0.5 rounded-md border",
                                                                cate.isPrimary
                                                                    ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                                                    : "bg-muted/40 text-muted-foreground border-border"
                                                            )}>
                                                                {cate.category.name}
                                                            </span>
                                                            {index < item.categories.length - 1 && <p>/</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground text-xs">
                                                {item.brand?.name || "—"}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center flex-col gap-1">
                                                    {!item.variants?.length ? (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    ) : (
                                                        item.variants.map(variant => {
                                                            const color = variant.attributes?.find(attr => attr.key === "color")?.value;
                                                            const sizes = variant.attributes?.filter(attr => attr.key === "size") ?? [];
                                                            const image = variant.variantImages?.find(img => img.isMain) ?? variant.variantImages?.[0];
                                                            const stock = Number(variant.stock);
                                                            const price = Number(variant.price);

                                                            return (
                                                                <div
                                                                    key={variant.id}
                                                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                                                                >
                                                                    {image?.thumbnail ? (
                                                                        <img
                                                                            src={image.thumbnail}
                                                                            alt={color || variant.sku}
                                                                            className="w-8 h-8 rounded-md object-cover border shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-md bg-muted border shrink-0" />
                                                                    )}

                                                                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                                                        {color && <span className="text-xs font-medium text-foreground">{color}</span>}
                                                                        {sizes.map(size => (
                                                                            <span className="text-[11px] px-1.5 py-0.5 rounded-md border bg-background text-muted-foreground font-mono" key={size.id}>
                                                                                {size.value}
                                                                            </span>
                                                                        ))}
                                                                        <span className="text-muted-foreground/40 text-xs">·</span>
                                                                        <span className="text-xs font-medium text-foreground tabular-nums">
                                                                            {fmt(price)}
                                                                        </span>
                                                                        <span className="text-muted-foreground/40 text-xs">·</span>
                                                                        <span className={cn(
                                                                            "text-xs font-semibold tabular-nums",
                                                                            stock === 0 ? "text-red-500" :
                                                                                stock < 20 ? "text-amber-500" :
                                                                                    "text-emerald-600"
                                                                        )}>
                                                                            Tồn {stock}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {item.basePrice ? (
                                                    <span className="text-sm font-semibold text-red-500">
                                                        {fmt(Number(item.basePrice))}
                                                    </span>
                                                ) : "—"}
                                            </TableCell>

                                            <TableCell className="text-muted-foreground text-xs">
                                                {formatDate(item.createdAt)}
                                            </TableCell>

                                            <TableCell className="text-muted-foreground text-xs">
                                                {item.updatedAt ? formatDate(item.updatedAt) : "—"}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`edit/${item.id}`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Pencil size={14} />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(item)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between px-2 py-3 border-t">
                        <p className="text-xs text-muted-foreground">
                            Hiển thị{" "}
                            <span className="font-medium text-foreground">
                                {pagination?.total ? (pagination.page - 1) * pagination.limit + 1 : 0}
                            </span>
                            {" "}–{" "}
                            <span className="font-medium text-foreground">
                                {pagination?.total ? Math.min(pagination.page * pagination.limit, pagination.total) : 0}
                            </span>
                            {" "}trong{" "}
                            <span className="font-medium text-foreground">{pagination?.total || 0}</span>
                            {" "}sản phẩm
                        </p>

                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => onPageChange(pagination?.page - 1)}
                                        className={cn(
                                            "cursor-pointer",
                                            pagination?.page <= 1 && "pointer-events-none opacity-40"
                                        )}
                                    />
                                </PaginationItem>

                                {visiblePages.map(page => (
                                    typeof page === "string" ? (
                                        <PaginationItem key={page}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={page === pagination?.page}
                                                onClick={() => onPageChange(page)}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => onPageChange(pagination?.page + 1)}
                                        className={cn(
                                            "cursor-pointer",
                                            pagination?.page >= pagination?.totalPages && "pointer-events-none opacity-40"
                                        )}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            )}
        </div>
    );
};
