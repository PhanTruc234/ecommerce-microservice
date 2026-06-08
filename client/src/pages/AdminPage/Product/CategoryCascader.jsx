import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const CategoryCascader = ({ control, errors, categories, value: externalValue }) => {
    const [selectedL1, setSelectedL1] = useState(null)
    const [selectedL2, setSelectedL2] = useState(null)
    const [selectedL3, setSelectedL3] = useState(null)

    const l2List = selectedL1?.children ?? []
    const l3List = selectedL2?.children ?? []

    useEffect(() => {
        if (!externalValue?.length || !categories?.length) return
        for (const l1 of categories) {
            const matchL1 = externalValue.find(v => v.id === l1.id)
            if (matchL1) {
                setSelectedL1(l1)
                for (const l2 of l1.children ?? []) {
                    const matchL2 = externalValue.find(v => v.id === l2.id)
                    if (matchL2) {
                        setSelectedL2(l2)
                        for (const l3 of l2.children ?? []) {
                            const matchL3 = externalValue.find(v => v.id === l3.id)
                            if (matchL3) {
                                setSelectedL3(l3)
                            }
                        }
                    }
                }
                break
            }
        }
    }, [externalValue, categories])

    const buildCategoryIds = (l1, l2, l3) => {
        const result = []
        if (l1) result.push({ id: l1.id, isPrimary: true })
        if (l2) result.push({ id: l2.id, isPrimary: false })
        if (l3) result.push({ id: l3.id, isPrimary: false })
        return result
    }

    const handleL1 = (id, field) => {
        const cat = categories.find(c => c.id === id)
        setSelectedL1(cat)
        setSelectedL2(null)
        setSelectedL3(null)
        field.onChange(buildCategoryIds(cat, null, null))
    }

    const handleL2 = (id, field) => {
        const cat = l2List.find(c => c.id === id)
        setSelectedL2(cat)
        setSelectedL3(null)
        field.onChange(buildCategoryIds(selectedL1, cat, null))
    }

    const handleL3 = (id, field) => {
        const cat = l3List.find(c => c.id === id)
        setSelectedL3(cat)
        field.onChange(buildCategoryIds(selectedL1, selectedL2, cat))
    }

    return (
        <Controller
            control={control} gư t
            name="categoryIds"
            render={({ field }) => (
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <Select value={selectedL1?.id ?? ""} onValueChange={id => handleL1(id, field)}>
                            <SelectTrigger className={cn("border border-primary text-xs h-8", errors?.categoryIds && "border-red-400")}>
                                <SelectValue placeholder="Cấp 1" />
                            </SelectTrigger>
                            <SelectContent className="bg-secondary border border-primary">
                                {categories?.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold cursor-pointer">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedL2?.id ?? ""} onValueChange={id => handleL2(id, field)} disabled={!selectedL1}>
                            <SelectTrigger className="border border-primary text-xs h-8 disabled:opacity-40">
                                <SelectValue placeholder="Cấp 2" />
                            </SelectTrigger>
                            <SelectContent className="bg-secondary border border-primary">
                                {l2List.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id} className="text-xs cursor-pointer">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedL3?.id ?? ""} onValueChange={id => handleL3(id, field)} disabled={!selectedL2}>
                            <SelectTrigger className="border border-primary text-xs h-8 disabled:opacity-40">
                                <SelectValue placeholder="Cấp 3" />
                            </SelectTrigger>
                            <SelectContent className="bg-secondary border border-primary">
                                {l3List.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id} className="text-xs cursor-pointer">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {field.value?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {field.value.map((cat, i) => {
                                const label = [selectedL1, selectedL2, selectedL3][i]?.name ?? cat.id
                                return (
                                    <span key={cat.id} className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border",
                                        i === 0 && "bg-muted font-semibold border-border",
                                        i === 1 && "bg-muted/60 border-border/60",
                                        i === 2 && "bg-muted/30 border-border/40 text-muted-foreground"
                                    )}>
                                        {i > 0 && <span className="text-muted-foreground">{"└".repeat(i)}</span>}
                                        {label}
                                        {cat.isPrimary && <span className="text-[9px] text-blue-500 ml-0.5">●</span>}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {errors?.categoryIds && (
                        <p className="text-[11px] text-red-400">{errors.categoryIds.message}</p>
                    )}
                </div>
            )}
        />
    )
}