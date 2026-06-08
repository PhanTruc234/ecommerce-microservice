import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { productStore } from "@/stores/product.store";
import { ChevronDown, ChevronUp, Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AttributeForm } from "./AttributeForm";
import { ImageUploader } from "./ImageUpLoader";

export const VariantForm = ({ index, control, register, errors, remove, productId, setValue }) => {
    const [collapsed, setCollapsed] = useState(false);
    const isEditMode = !!productId;
    const { createVariant, updateVariant, deleteVariant, loading } = productStore();
    const variantValue = useWatch({ control, name: `variants.${index}` });

    const handleSaveVariant = async () => {
        try {
            if (variantValue?.id) {
                await updateVariant(productId, variantValue.id, {
                    price: Number(variantValue.price),
                    stock: Number(variantValue.stock),
                    images: variantValue.images,
                });
                toast.success("Cập nhật biến thể thành công");
            } else {
                const res = await createVariant(productId, {
                    price: Number(variantValue.price),
                    stock: Number(variantValue.stock),
                    images: variantValue.images,
                    attributes: variantValue.attributes,
                });

                const newId = res?.id ?? res?.data?.id;
                if (newId) {
                    setValue(`variants.${index}.id`, newId);
                }
                toast.success("Thêm biến thể thành công");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Thao tác thất bại");
        }
    };

    const handleDeleteVariant = async () => {
        try {
            if (variantValue?.id) {
                await deleteVariant(productId, variantValue.id);
                toast.success("Đã xóa biến thể");
            }
            remove(index);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa thất bại");
        }
    };

    return (
        <div className="border border-primary/30 rounded-xl overflow-hidden bg-muted/10">
            <button
                type="button"
                className="flex items-center justify-between w-full px-4 py-2.5 bg-muted/30 cursor-pointer select-none"
                onClick={() => setCollapsed(v => !v)}
            >
                <span className="text-sm font-medium">Biến thể #{index + 1}</span>
                <div className="flex items-center gap-1">
                    {isEditMode && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs gap-1 text-blue-500 hover:text-blue-600"
                            disabled={loading}
                            onClick={e => {
                                e.stopPropagation();
                                handleSaveVariant();
                            }}
                        >
                            <Save size={11} />
                            {variantValue?.id ? "Cập nhật" : "Lưu mới"}
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-400"
                        onClick={e => {
                            e.stopPropagation();
                            isEditMode ? handleDeleteVariant() : remove(index);
                        }}
                    >
                        <Trash2 size={12} />
                    </Button>
                    {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
            </button>

            {!collapsed && (
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Giá (₫)" required>
                            <Label>Nhập giá</Label>
                            <Input
                                type="number"
                                placeholder="850000"
                                className={cn(
                                    "border border-primary",
                                    errors?.variants?.[index]?.price && "border-red-400"
                                )}
                                {...register(`variants.${index}.price`)}
                            />
                            {errors?.variants?.[index]?.price && (
                                <p className="text-[11px] text-red-400 mt-1">
                                    {errors.variants[index].price.message}
                                </p>
                            )}
                        </Field>

                        <Field label="Tồn kho" required>
                            <Label>Nhập tồn kho</Label>
                            <Input
                                type="number"
                                placeholder="100"
                                className={cn(
                                    "border border-primary",
                                    errors?.variants?.[index]?.stock && "border-red-400"
                                )}
                                {...register(`variants.${index}.stock`)}
                            />
                            {errors?.variants?.[index]?.stock && (
                                <p className="text-[11px] text-red-400 mt-1">
                                    {errors.variants[index].stock.message}
                                </p>
                            )}
                        </Field>
                    </div>

                    <Field label="Ảnh biến thể">
                        <Controller
                            control={control}
                            name={`variants.${index}.images`}
                            render={({ field }) => (
                                <ImageUploader
                                    value={field.value ?? []}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </Field>

                    <div className="border border-dashed border-primary/30 rounded-lg p-3">
                        <AttributeForm
                            variantIndex={index}
                            control={control}
                            register={register}
                            errors={errors}
                            productId={productId}
                            variantId={variantValue?.id}
                            setValue={setValue}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
