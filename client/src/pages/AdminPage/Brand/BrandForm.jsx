import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { brandStore } from '@/stores/brand.store'
import { Loader2, Upload, X } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { describe } from 'zod/v4/core'

export const BrandForm = ({ mode, initialData, onSuccess }) => {
    const { create, update, uploadLogo, deleteImg, loading } = brandStore()
    const [form, setForm] = React.useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        logoUrl: initialData?.logoUrl || null,
        logoPublicId: initialData?.logoPublicId || null,
        action: false
    })
    const handleClose = async () => {
        if (form.action) {
            await deleteImg(form.logoPublicId)
        }
        await onSuccess()
    }
    const handleImgChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const res = await uploadLogo(file)
            toast.success("Upload ảnh thành công")
            setForm((prev) => ({ ...prev, logoUrl: res.url, logoPublicId: res.publicId, action: true }))
        } catch (error) {
            toast.error("Upload ảnh thất bại")
        }
    }
    const handleSubmit = async () => {
        if (!form.name.trim()) return toast.error("Vui lòng nhập tên thương hiệu")
        try {
            const payload = {
                name: form.name,
                description: form.description,
                thumbnail: form.logoUrl,
                thumbnailId: form.logoPublicId
            }

            if (mode === "add") {
                await create(payload)
                toast.success("Thêm thương hiệu thành công")
            } else {
                await update(initialData.id, payload)
                toast.success("Cập nhật thương hiệu thành công")
            }
            await onSuccess()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra")
        }
    }
    const handleRemoveImg = async () => {
        if (form.action) {
            await deleteImg(form.logoPublicId)
        }
        setForm((prev) => ({ ...prev, logoUrl: null, logoPublicId: null, action: false }))
    }
    return (
        <div className="space-y-4">
            <div className="mb-5 flex justify-end">
                <button
                    onClick={handleClose}
                    className=""
                >
                    <X size={18} />
                </button>
            </div>
            <div className="space-y-1.5">
                <Label>Tên thương hiệu <span className="text-red-500">*</span></Label>
                <Input
                    placeholder="VD: Nike..."
                    value={form.name}
                    className="border border-grays-700"
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
            </div>
            <div className="space-y-1.5">
                <Label>Mô tả</Label>
                <Textarea
                    placeholder="VD: Thương hiệu thời trang hàng đầu..."
                    value={form.description}
                    className="border border-grays-700"
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
            </div>
            <div className="space-y-1.5">
                <Label>Ảnh thương hiệu</Label>
                {form.logoUrl ? (
                    <div className="relative w-fit">
                        <img src={form.logoUrl} alt="" className="w-24 h-24 rounded-xl object-cover border" />
                        <button
                            onClick={handleRemoveImg}
                            className="absolute -top-2 -right-2 bg-white border rounded-full p-0.5 text-red-500 hover:bg-red-50"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                        {loading ? (
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload size={20} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-1">Click để upload</span>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImgChange} disabled={loading} />
                    </label>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleClose}>Hủy</Button>
                <Button onClick={handleSubmit} disabled={loading} className="text-secondary">
                    {loading && <Loader2 size={14} className="animate-spin mr-1" />}
                    {mode === "edit" ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </div>
    )
}
