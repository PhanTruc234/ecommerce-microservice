// CategoryForm.jsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import { categoryStore } from "@/stores/category.store"


export const CategoryForm = ({ mode, initialData, allCategories, onSuccess }) => {
    const { add, update, uploadImg, deleteImg } = categoryStore()
    const isEdit = mode === "edit"
    const parentOptions = allCategories.flatMap(c1 => [
        { id: c1.id, name: c1.name, level: 1 },
        ...(c1.children || []).map(c2 => ({
            id: c2.id, name: `${c1.name} → ${c2.name}`, level: 2
        }))
    ])

    const [form, setForm] = useState({
        name: initialData?.name || "",
        parentId: initialData?.parentId || "",
    })
    const [imgFile, setImgFile] = useState(null)
    const [imgPreview, setImgPreview] = useState(initialData?.imageUrl || null)
    const [imgPublicId, setImgPublicId] = useState(initialData?.imagePubclicId || null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleImgChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImgPreview(URL.createObjectURL(file))
        setUploading(true)
        try {
            const res = await uploadImg(file)

            setImgPublicId(res.publicId)
            setImgPreview(res.url)
            toast.success("Upload ảnh thành công")
        } catch {
            toast.error("Upload ảnh thất bại")
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveImg = async () => {
        if (imgPublicId) {
            await deleteImg(imgPublicId).catch(() => { })
        }
        setImgPreview(null)
        setImgPublicId(null)
    }

    const handleSubmit = async () => {
        if (!form.name.trim()) return toast.error("Vui lòng nhập tên danh mục")
        setLoading(true)
        try {
            const payload = {
                name: form.name,
                parentId: form.parentId || undefined,
                thumbnail: imgPreview || undefined,
                thumbnailId: imgPublicId || undefined,
            }
            if (isEdit) {
                await update(initialData.id, payload)
                toast.success("Cập nhật thành công")
            } else {
                await add(payload)
                toast.success("Thêm danh mục thành công")
            }
            onSuccess()
        } catch (e) {
            toast.error(e?.response?.data?.message || "Có lỗi xảy ra")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Tên danh mục <span className="text-red-500">*</span></Label>
                <Input
                    placeholder="VD: Áo polo, Quần jean..."
                    value={form.name}
                    className="border"
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
            </div>

            <div className="space-y-1.5">
                <Label>Danh mục cha</Label>
                <Select
                    value={form.parentId || "none"}
                    onValueChange={v => setForm(f => ({ ...f, parentId: v === "none" ? "" : v }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Không có (cấp 1)" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-secondary">
                        <SelectItem value="none">Không có (cấp 1)</SelectItem>
                        {parentOptions.map(p => (
                            <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                                {p.level === 2 ? `  ↳ ${p.name}` : p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Không chọn = cấp 1, chọn cấp 1 = tạo cấp 2, chọn cấp 2 = tạo cấp 3
                </p>
            </div>
            <div className="space-y-1.5">
                <Label>Ảnh danh mục</Label>
                {imgPreview ? (
                    <div className="relative w-fit">
                        <img src={imgPreview} alt="" className="w-24 h-24 rounded-xl object-cover border" />
                        <button
                            onClick={handleRemoveImg}
                            className="absolute -top-2 -right-2 bg-white border rounded-full p-0.5 text-red-500 hover:bg-red-50"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                        {uploading ? (
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload size={20} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-1">Click để upload</span>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImgChange} disabled={uploading} />
                    </label>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onSuccess}>Hủy</Button>
                <Button onClick={handleSubmit} disabled={loading || uploading} className="text-secondary">
                    {loading && <Loader2 size={14} className="animate-spin mr-1" />}
                    {isEdit ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </div>
    )
}