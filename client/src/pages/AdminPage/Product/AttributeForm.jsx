import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { productStore } from '@/stores/product.store'
import { Plus, Save, Trash2 } from 'lucide-react'
import React from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

export const AttributeForm = ({ variantIndex, control, register, errors, productId, variantId, setValue }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `variants.${variantIndex}.attributes`,
    })
    const isEditMode = !!productId && !!variantId
    const { createAttribute, updateAttribute, deleteAttribute, loading } = productStore()

    const attributeValues = useWatch({
        control,
        name: `variants.${variantIndex}.attributes`,
    })

    const handleSaveAttribute = async (attrIdx) => {
        const attr = attributeValues?.[attrIdx]
        if (!attr?.key || !attr?.value) {
            toast.error("Vui lòng nhập đủ key và value")
            return
        }
        try {
            if (attr.id) {
                await updateAttribute(productId, variantId, attr.id, {
                    key: attr.key,
                    value: attr.value,
                })
                toast.success("Cập nhật thuộc tính thành công")
            } else {
                const res = await createAttribute(productId, variantId, {
                    key: attr.key,
                    value: attr.value,
                })
                const newId = res?.id ?? res?.data?.id
                if (newId) {
                    setValue(`variants.${variantIndex}.attributes.${attrIdx}.id`, newId)
                }
                toast.success("Thêm thuộc tính thành công")
            }
        } catch {
            toast.error("Thất bại")
        }
    }

    const handleDeleteAttribute = async (attrIdx) => {
        const attr = attributeValues?.[attrIdx]

        try {
            if (attr?.id && isEditMode) {
                await deleteAttribute(productId, variantId, attr.id)
                toast.success("Đã xóa thuộc tính")
            }
            remove(attrIdx)
        } catch {
            toast.error("Xóa thất bại")
        }
    }
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Thuộc tính
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs gap-1"
                    onClick={() => append({ key: "", value: "" })}
                >
                    <Plus size={11} />
                    Thêm thuộc tính
                </Button>
            </div>

            {fields.length === 0 && (
                <p className="text-xs text-muted-foreground/60 italic py-1">
                    Chưa có thuộc tính nào
                </p>
            )}

            {fields.map((attr, attrIdx) => (
                <div key={attr.id} className="flex items-start gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="key (vd: color)"
                            className={cn(
                                "h-8 text-xs border border-primary",
                                errors?.variants?.[variantIndex]?.attributes?.[attrIdx]?.key && "border-red-400"
                            )}
                            {...register(`variants.${variantIndex}.attributes.${attrIdx}.key`)}
                        />
                        {errors?.variants?.[variantIndex]?.attributes?.[attrIdx]?.key && (
                            <p className="text-[10px] text-red-400 mt-0.5">
                                {errors.variants[variantIndex].attributes[attrIdx].key.message}
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="value (vd: Đỏ)"
                            className={cn(
                                "h-8 text-xs border border-primary",
                                errors?.variants?.[variantIndex]?.attributes?.[attrIdx]?.value && "border-red-400"
                            )}
                            {...register(`variants.${variantIndex}.attributes.${attrIdx}.value`)}
                        />
                        {errors?.variants?.[variantIndex]?.attributes?.[attrIdx]?.value && (
                            <p className="text-[10px] text-red-400 mt-0.5">
                                {errors.variants[variantIndex].attributes[attrIdx].value.message}
                            </p>
                        )}
                    </div>
                    {isEditMode && (
                        <Button
                            type="button" variant="ghost" size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 shrink-0"
                            disabled={loading}
                            onClick={() => handleSaveAttribute(attrIdx)}
                            title={attributeValues?.[attrIdx]?.id ? "Cập nhật" : "Lưu mới"}
                        >
                            <Save size={12} />
                        </Button>
                    )}

                    <Button
                        type="button" variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400 shrink-0"
                        onClick={() => handleDeleteAttribute(attrIdx)}
                    >
                        <Trash2 size={12} />
                    </Button>
                </div>
            ))}
        </div>
    )
}
