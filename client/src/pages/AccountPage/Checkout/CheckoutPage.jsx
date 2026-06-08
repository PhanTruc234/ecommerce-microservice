import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, PackageCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { fmt } from "@/lib/convertMoney";
import { AuthStore } from "@/stores/auth.store";
import { CartStore } from "@/stores/cart.store";
import { orderStore } from "@/stores/order.store";
import { paymentStore } from "@/stores/payment.store";


const checkoutSchema = z.object({
    receiverName: z.string().trim().min(1, "Vùi lòng nhập tên người nhận"),
    receiverPhone: z
        .string()
        .trim()
        .min(8, "Số điện thoại không hợp lệ")
        .max(15, "Số điện thoại không hợp lệ"),
    addressLine: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
    ward: z.string().optional(),
    province: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành"),
    paymentMethod: z.enum(["COD", "BANK_TRANSFER", "MOMO", "VNPAY"]),
    note: z.string().optional(),
});


export const CheckoutPage = () => {
    const navigate = useNavigate();
    const user = AuthStore((state) => state.user);
    const { checkoutData, checkout, create, loading } = orderStore();
    const { createPaymentLink } = paymentStore()
    const { setCartFromServer } = CartStore();


    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(checkoutSchema),
        mode: "onChange",
        defaultValues: {
            receiverName: user?.name || "",
            receiverPhone: user?.phone || "",
            addressLine: user?.address || "",
            ward: user?.ward || "",
            province: user?.province || "",
            paymentMethod: "COD",
            note: "",
        },
    });


    const provinceField = register("province");
    const items = checkoutData?.items || [];
    const summary = checkoutData?.summary || {};
    const canSubmit = isValid && items.length > 0 && !loading && !isSubmitting;


    // useEffect(() => {
    //     checkout({ province: getValues("province") }).catch(() => {
    //         toast.error("Không lấy được thông tin thanh toán");
    //         navigate("/cart");
    //     });
    // }, []);


    const refreshPreviewByProvince = async (province) => {
        try {
            await checkout({ province });
        } catch (error) {
            toast.error("Không cập nhật được phí vận chuyển");
        }
    };
    const onSubmit = async (values) => {
        try {
            const order = await create(values);
            if (values.paymentMethod !== "COD") {
                const payment = await createPaymentLink(order.id);
                if (!payment?.checkoutUrl) {
                    throw new Error("Khong tao duoc link thanh toan");
                }
                window.location.href = payment.checkoutUrl;
                setCartFromServer([]);
                return;
            }
            navigate("/cart", { state: { orderCode: order?.orderCode } });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Đặt hàng thất bại");
        }
    };


    if (loading && !checkoutData) {
        return (
            <div className="container my-40 flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="size-8 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin" />
                <p className="text-sm">Đang tải thông tin thanh toán</p>
            </div>
        );
    }


    if (!items.length) {
        return (
            <div className="container my-40 flex flex-col items-center justify-center gap-4 text-gray-400">
                <ShoppingBag size={54} strokeWidth={1} />
                <p className="text-base">Không có sản phẩm để thanh toán</p>
                <button
                    onClick={() => navigate("/cart")}
                    className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm text-white transition-colors hover:bg-gray-700"
                >
                    Quay lại giỏ hàng
                </button>
            </div>
        );
    }


    return (
        <div className="container my-32">
            <button
                onClick={() => navigate("/cart")}
                className="mb-5 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700"
            >
                <ArrowLeft size={15} />
                Quay lại giỏ hàng
            </button>


            <h1 className="mb-6 text-2xl font-semibold">Thanh toán</h1>


            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
                <div className="flex flex-col gap-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin size={18} />
                            <h2 className="text-base font-semibold">Thông tin nhận hàng</h2>
                        </div>


                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="text-gray-500">Người nhận</span>
                                <input
                                    {...register("receiverName")}
                                    className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-gray-500"
                                />
                                {errors.receiverName && <span className="text-xs text-red-500">{errors.receiverName.message}</span>}
                            </label>


                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="text-gray-500">Số điện thoại</span>
                                <input
                                    {...register("receiverPhone")}
                                    className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-gray-500"
                                />
                                {errors.receiverPhone && <span className="text-xs text-red-500">{errors.receiverPhone.message}</span>}
                            </label>


                            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
                                <span className="text-gray-500">Địa chỉ</span>
                                <input
                                    {...register("addressLine")}
                                    className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-gray-500"
                                />
                                {errors.addressLine && <span className="text-xs text-red-500">{errors.addressLine.message}</span>}
                            </label>


                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="text-gray-500">Phường/xã</span>
                                <input
                                    {...register("ward")}
                                    className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-gray-500"
                                />
                            </label>


                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="text-gray-500">Tỉnh/thành</span>
                                <input
                                    {...provinceField}
                                    onBlur={(event) => {
                                        provinceField.onBlur(event);
                                        refreshPreviewByProvince(event.target.value);
                                    }}
                                    className="h-10 rounded-lg border border-gray-200 px-3 outline-none focus:border-gray-500"
                                />
                                {errors.province && <span className="text-xs text-red-500">{errors.province.message}</span>}
                            </label>


                            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
                                <span className="text-gray-500">Ghi chú</span>
                                <textarea
                                    {...register("note")}
                                    rows={3}
                                    className="resize-none rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-gray-500"
                                />
                            </label>
                        </div>
                    </section>


                    <section className="rounded-xl border border-gray-100 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <CreditCard size={18} />
                            <h2 className="text-base font-semibold">Phương thức thanh toán</h2>
                        </div>


                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {["COD", "BANK_TRANSFER", "MOMO", "VNPAY"].map((method) => (
                                <label
                                    key={method}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm transition-colors has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50"
                                >
                                    <input type="radio" value={method} {...register("paymentMethod")} />
                                    <span>{method === "COD" ? "Nhận hàng" : method === "BANK_TRANSFER" ? "Chuyển khoản" : method}</span>
                                </label>
                            ))}
                        </div>
                        {errors.paymentMethod && <p className="mt-2 text-xs text-red-500">{errors.paymentMethod.message}</p>}
                    </section>
                    <section className="rounded-xl border border-gray-100 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <PackageCheck size={18} />
                            <h2 className="text-base font-semibold">Sản phẩm</h2>
                        </div>


                        <div className="flex flex-col divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.cartItemId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                <ShoppingBag size={28} strokeWidth={1} />
                                            </div>
                                        )}
                                    </div>


                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.productName}</p>
                                        <p className="mt-0.5 truncate text-xs text-gray-400">{item.variantSku}</p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-gray-500">
                                            {item.color && <span>Mau: {item.color}</span>}
                                            {item.size && <span>Size: {item.size}</span>}
                                            <span>SL: {item.quantity}</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {item.discountAmount > 0 && (
                                                <span className="text-xs text-gray-400 line-through">{fmt(item.price)}</span>
                                            )}
                                            <span className="text-sm font-semibold">{fmt(item.finalPrice)}</span>
                                            {item.discountAmount > 0 && (
                                                <span className="text-xs text-green-600">-{fmt(item.discountAmount)}</span>
                                            )}
                                        </div>
                                    </div>


                                    <div className="flex-shrink-0 text-right text-sm font-semibold">
                                        {fmt(item.lineTotal)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>


                <aside className="sticky top-20 rounded-xl border border-gray-100 bg-white p-5">
                    <p className="mb-4 text-base font-semibold">Tóm tắt đơn hàng</p>


                    <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Sản phẩm</span>
                            <span>{summary.totalItems || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Tạm tính</span>
                            <span>{fmt(summary.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Giảm giá</span>
                            <span>-{fmt(summary.discountAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Phí vận chuyển</span>
                            <span>{Number(summary.shippingFee) === 0 ? "Mien phi" : fmt(summary.shippingFee)}</span>
                        </div>
                        <div className="mt-1 flex justify-between border-t border-gray-100 pt-3 text-base font-semibold">
                            <span>Tổng cộng</span>
                            <span>{fmt(summary.totalAmount)}</span>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="mt-5 h-11 w-full rounded-lg bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading || isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
                    </button>
                </aside>
            </form>
        </div>
    );
};



