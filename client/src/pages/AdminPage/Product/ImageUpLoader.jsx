import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { productStore } from "@/stores/product.store";

export const ImageUploader = ({ value = [], onChange, max = 10 }) => {
    const { uploadImg, deleteTemp, loading } = productStore();

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";

        if (!files.length) return;
        if (value.length + files.length > max) {
            toast.error(`Chỉ được upload tối đa ${max} ảnh`);
            return;
        }

        try {
            const uploaded = await uploadImg(files);

            const nextImages = uploaded.map((img, index) => ({
                thumbnail: img.url,
                thumbnailId: img.public_id,
                isMain: value.length === 0 && index === 0,
            }));

            onChange([...value, ...nextImages]);
            toast.success("Upload ảnh thành công");
        } catch {
            toast.error("Upload ảnh thất bại");
        }
    };

    const removeImage = async (image) => {
        try {
            if (image.thumbnailId) {
                await deleteTemp(image.thumbnailId);
            }

            const next = value.filter(img => img.thumbnailId !== image.thumbnailId);

            if (image.isMain && next.length > 0) {
                next[0].isMain = true;
            }

            onChange(next);
        } catch {
            toast.error("Xóa ảnh thất bại");
        }
    };

    const setMain = (thumbnailId) => {
        onChange(value.map(img => ({
            ...img,
            isMain: img.thumbnailId === thumbnailId,
        })));
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 border border-dashed border-primary rounded-lg h-28 cursor-pointer">
                <Upload size={16} />
                <span className="text-sm">
                    {loading ? "Đang upload..." : "Upload ảnh"}
                </span>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    disabled={loading}
                    onChange={handleUpload}
                />
            </label>

            {value.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                    {value.map((img) => (
                        <div key={img.thumbnailId} className="relative group">
                            <img
                                src={img.thumbnail}
                                alt=""
                                className={cn(
                                    "w-full aspect-square object-cover rounded-lg border",
                                    img.isMain ? "border-blue-500 ring-2 ring-blue-500/30" : "border-primary/30"
                                )}
                            />

                            {img.isMain && (
                                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    chính
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => setMain(img.thumbnailId)}
                                className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded"
                            >
                                Chính
                            </button>

                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeImage(img)}
                            >
                                <Trash2 size={12} />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};