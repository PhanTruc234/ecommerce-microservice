import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBrand } from "@/hooks/brand/useBrand";
import { useCategory } from "@/hooks/category/useCategory";
import { useProducts } from "@/hooks/product/useProduct";
import { cn } from "@/lib/utils";
import { productStore } from "@/stores/product.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React, { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { CategoryCascader } from "./CategoryCascader";
import { ImageUploader } from "./ImageUpLoader";
import { VariantForm } from "./VariantForm";

const imageSchema = z.object({
    thumbnail: z.string().url("Ảnh không hợp lệ"),
    thumbnailId: z.string().min(1, "Thiếu mã ảnh"),
    isMain: z.boolean().default(false),
});

const attributeSchema = z.object({
    id: z.string().optional(),
    key: z.string().min(1, "Nhập key"),
    value: z.string().min(1, "Nhập value"),
});

const variantSchema = z.object({
    id: z.string().optional(),
    price: z.coerce.number({ invalid_type_error: "Nhập giá" }).positive("Giá phải > 0"),
    stock: z.coerce.number({ invalid_type_error: "Nhập tồn kho" }).int().min(0),
    attributes: z.array(attributeSchema).default([]),
    images: z.array(imageSchema).default([]),
});

const productSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được trống"),
    description: z.string().optional(),
    basePrice: z.coerce.number({ invalid_type_error: "Nhập giá" }).positive("Giá phải > 0"),
    brandId: z.string().min(1, "Chọn thương hiệu"),
    categoryIds: z.array(
        z.object({
            id: z.string().min(1),
            isPrimary: z.boolean().default(false),
        })
    ).min(1, "Chọn ít nhất 1 danh mục"),
    images: z.array(imageSchema).default([]),
    variants: z.array(variantSchema).default([]),
});

export const ProductForm = ({ id }) => {
    const navigate = useNavigate();
    const { create, update, loading, getProductById } = productStore();
    const { refreshProducts } = useProducts();
    const { brands } = useBrand();
    const { categories } = useCategory();

    const { register, control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            basePrice: "",
            brandId: "",
            categoryIds: [],
            images: [],
            variants: [],
        },
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants",
    });

    const categoryIds = useWatch({ control, name: "categoryIds" });

    const onSubmit = async (data) => {
        try {
            if (id) {
                await update(id, data);
                toast.success("Sửa sản phẩm thành công");
            } else {
                await create(data);
                toast.success("Thêm sản phẩm thành công");
            }

            navigate("/admin/product");
            refreshProducts();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Thao tác thất bại");
        }
    };

    useEffect(() => {
        if (!id) return;

        const getProduct = async () => {
            const data = await getProductById(id);
            const product = Array.isArray(data) ? data[0] : data;
            if (!product) return;

            reset({
                name: product.name || "",
                description: product.description || "",
                basePrice: Number(product.basePrice) || 0,
                brandId: product.brandId || "",
                categoryIds: product.categories?.map(c => ({
                    id: c.categoryId,
                    isPrimary: c.isPrimary ?? false,
                })) || [],
                images: product.productImages?.map(img => ({
                    thumbnail: img.thumbnail,
                    thumbnailId: img.thumbnailId,
                    isMain: img.isMain,
                })) || [],
                variants: product.variants?.map(v => ({
                    id: v.id,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0,
                    attributes: v.attributes?.map(a => ({
                        id: a.id,
                        key: a.key,
                        value: a.value,
                    })) || [],
                    images: v.variantImages?.map(img => ({
                        thumbnail: img.thumbnail,
                        thumbnailId: img.thumbnailId,
                        isMain: img.isMain,
                    })) || [],
                })) || [],
            });
        };

        getProduct();
    }, [id, getProductById, reset]);

    return (
        <div>
            <h1 className="text-5xl font-semibold">{id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="overflow-y-auto px-6 py-5 space-y-5">
                    <Field label="Tên sản phẩm" required>
                        <Label>Nhập tên</Label>
                        <Input
                            placeholder="Nhập tên sản phẩm..."
                            className={cn("border border-primary", errors.name && "border-red-400")}
                            {...register("name")}
                        />
                        {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>}
                    </Field>

                    <Field label="Mô tả">
                        <Label>Nhập mô tả</Label>
                        <Textarea
                            placeholder="Mô tả sản phẩm..."
                            rows={3}
                            className="resize-none border border-primary"
                            {...register("description")}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Giá cơ bản (₫)" required>
                            <Label>Nhập giá</Label>
                            <Input
                                type="number"
                                placeholder="Nhập giá..."
                                className={cn("border border-primary", errors.basePrice && "border-red-400")}
                                {...register("basePrice")}
                            />
                            {errors.basePrice && <p className="text-[11px] text-red-400 mt-1">{errors.basePrice.message}</p>}
                        </Field>

                        <Field label="Thương hiệu" required>
                            <Label>Chọn thương hiệu</Label>
                            <Controller
                                control={control}
                                name="brandId"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={cn("border border-primary", errors.brandId && "border-red-400")}>
                                            <SelectValue placeholder="Chọn thương hiệu" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-secondary border border-primary">
                                            {brands?.map(brand => (
                                                <SelectItem key={brand.id} value={brand.id} className="cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        {brand.thumbnail && (
                                                            <img src={brand.thumbnail} alt={brand.name} className="w-4 h-4 rounded object-contain" />
                                                        )}
                                                        {brand.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.brandId && <p className="text-[11px] text-red-400 mt-1">{errors.brandId.message}</p>}
                        </Field>

                        <Field label="Danh mục" required>
                            <Label>Chọn danh mục</Label>
                            <CategoryCascader
                                control={control}
                                errors={errors}
                                categories={categories}
                                value={categoryIds}
                            />
                        </Field>
                    </div>

                    <div className="space-y-2">
                        <Label>Ảnh sản phẩm</Label>
                        <Controller
                            control={control}
                            name="images"
                            render={({ field }) => (
                                <ImageUploader
                                    value={field.value ?? []}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Biến thể sản phẩm</span>
                            <span className="text-xs text-muted-foreground">{variantFields.length} biến thể</span>
                        </div>

                        {variantFields.map((variant, index) => (
                            <VariantForm
                                key={variant.id}
                                index={index}
                                control={control}
                                register={register}
                                errors={errors}
                                remove={removeVariant}
                                productId={id}
                                setValue={setValue}
                            />
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 border-dashed"
                            onClick={() => appendVariant({
                                price: "",
                                stock: "",
                                attributes: [],
                                images: [],
                            })}
                        >
                            <Plus size={14} />
                            Thêm biến thể
                        </Button>
                    </div>
                </div>

                <div className="border-t px-6 py-4 flex items-center justify-end gap-2">
                    <Link to="/admin/product" className="text-secondary bg-primary py-1 px-6">
                        Quay lại
                    </Link>
                    <Button type="submit" disabled={loading} className="text-secondary">
                        {loading ? "Đang lưu..." : id ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
