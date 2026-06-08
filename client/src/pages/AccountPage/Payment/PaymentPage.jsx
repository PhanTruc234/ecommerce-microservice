import { fmt } from "@/lib/convertMoney";
import { paymentStore } from "@/stores/payment.store";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    Home,
    ReceiptText,
    RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BANK_NAME_BY_CODE = {
    "01310001": "Techcombank",
    "970415": "VietinBank",
    "970436": "Vietcombank",
    "970418": "BIDV",
    "970405": "Agribank",
    "970448": "OCB",
    "970422": "MB Bank",
    "970407": "Techcombank",
    "970416": "ACB",
    "970432": "VPBank",
    "970423": "TPBank",
    "970403": "Sacombank",
    "970437": "HDBank",
    "970454": "Viet Capital Bank",
    "970429": "SCB",
    "970441": "VIB",
    "970443": "SHB",
    "970431": "Eximbank",
    "970426": "MSB",
    "970421": "VRB",
    "970440": "SeABank",
    "970428": "Nam A Bank",
    "970414": "OceanBank",
    "970409": "Bac A Bank",
    "970412": "PVcomBank",
    "970430": "PGBank",
    "970400": "SaigonBank",
    "970419": "NCB",
    "970425": "ABBank",
    "970427": "VietABank",
    "970452": "KienlongBank",
    "970433": "VietBank",
    "970449": "LPBank",
    "970438": "BaoVietBank",
    "970439": "Public Bank Vietnam",
    "970446": "Co-opBank",
    "970444": "CB Bank",
    "970410": "Standard Chartered Vietnam",
    "970424": "Shinhan Bank Vietnam",
    "970458": "UOB Vietnam",
    "970466": "KEB Hana HCM",
    "970467": "KEB Hana Hanoi",
    "422589": "CIMB Vietnam",
    "668888": "KBank Vietnam",
    "546034": "CAKE by VPBank",
    "546035": "Ubank by VPBank",
    "963388": "Timo",
    "999888": "VBSP",
};
const PAYMENT_STATUS_LABEL = {
    PAID: "Đã thanh toán",
    UNPAID: "Chưa thanh toán",
    FAILED: "Thanh toán thất bại",
    CANCELLED: "Đã hủy",
    PENDING: "Đang chờ thanh toán",
    PROCESSING: "Đang xử lý",
    EXPIRED: "Đã hết hạn",
};

const getPaymentStatusLabel = (status) => {
    return PAYMENT_STATUS_LABEL[status] || status || "Đang kiểm tra";
};
const getBankName = (transaction) => {
    const code = transaction?.counterAccountBankId;

    return (
        transaction?.counterAccountBankName ||
        BANK_NAME_BY_CODE[code] ||
        code ||
        "-"
    );
};

export const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const { confirmPayment, loading } = paymentStore();
    const confirmedRef = useRef(false);
    const [payment, setPayment] = useState(null);
    const [error, setError] = useState("");

    const orderId = searchParams.get("orderId");
    const payosOrderCode = searchParams.get("orderCode");
    const isCancelled = searchParams.get("cancel") === "true";

    useEffect(() => {
        if (!orderId || !payosOrderCode || confirmedRef.current) return;
        confirmedRef.current = true;
        const handleConfirm = async () => {
            try {
                const data = await confirmPayment({
                    orderId,
                    payosOrderCode,
                });
                setPayment(data);
            } catch (error) {
                setError(error?.response?.data?.message || "Không thể xác nhận thanh toán");
            }
        };
        handleConfirm();
    }, [confirmPayment, orderId, payosOrderCode]);
    const view = useMemo(() => {
        if (!orderId || !payosOrderCode) {
            return {
                tone: "error",
                icon: AlertCircle,
                title: "Thiếu thông tin thanh toán",
                description: "Không tìm thấy mã đơn hàng hoặc mã giao dịch PayOS.",
            };
        }

        if (error) {
            return {
                tone: "error",
                icon: AlertCircle,
                title: "Không thể xác nhận thanh toán",
                description: error,
            };
        }

        if (isCancelled || payment?.payosStatus === "CANCELLED" || payment?.paymentStatus === "FAILED") {
            return {
                tone: "error",
                icon: AlertCircle,
                title: "Thanh toán không thành công",
                description: "Đơn hàng đã bị hủy hoặc giao dịch chưa hoàn tất.",
            };
        }

        if (payment?.isPaid) {
            return {
                tone: "success",
                icon: CheckCircle2,
                title: "Thanh toán thành công",
                description: "Đơn hàng của bạn đã được xác nhận thanh toán.",
            };
        }

        if (payment) {
            return {
                tone: "pending",
                icon: Clock3,
                title: "Đang chờ xác nhận",
                description: "Giao dịch chưa hoàn tất. Bạn có thể kiểm tra lại sau ít phút.",
            };
        }

        return {
            tone: "pending",
            icon: Clock3,
            title: "Đang kiểm tra thanh toán",
            description: "Hệ thống đang đối soát giao dịch với PayOS.",
        };
    }, [error, isCancelled, orderId, payosOrderCode, payment]);

    const Icon = view.icon;
    const toneClass = {
        success: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        pending: "bg-amber-50 text-amber-600 ring-amber-100",
        error: "bg-red-50 text-red-600 ring-red-100",
    }[view.tone];

    return (
        <div className="container my-28">
            <div className="mx-auto max-w-2xl">
                <Link
                    to="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    Về trang chủ
                </Link>
                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-col items-center px-6 py-10 text-center">
                        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ring-8 ${toneClass}`}>
                            {loading && !payment && !error ? (
                                <div className="h-7 w-7 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            ) : (
                                <Icon size={34} strokeWidth={1.8} />
                            )}
                        </div>

                        <h1 className="text-2xl font-semibold text-gray-950">{view.title}</h1>
                        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{view.description}</p>
                    </div>
                    <div className="border-t border-gray-100 px-6 py-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InfoItem icon={ReceiptText} label="Mã đơn hàng" value={payment?.orderCode || orderId} />
                            <InfoItem icon={CreditCard} label="Mã Thanh Toán" value={payment?.payosOrderCode || payosOrderCode} />
                            <InfoItem label="Trạng thái đơn" value={payment?.orderStatus || "PENDING"} />
                            <InfoItem
                                label="Trạng thái thanh toán"
                                value={getPaymentStatusLabel(payment?.paymentStatus || payment?.payosStatus)}
                            />
                            {payment?.totalAmount !== undefined && (
                                <InfoItem label="Tổng thanh toán" value={fmt(payment.totalAmount)} />
                            )}
                            {payment?.amountPaid !== undefined && (
                                <InfoItem label="Đã thanh toán" value={fmt(payment.amountPaid)} />
                            )}
                        </div>
                    </div>
                    {payment?.transaction && (
                        <div className="border-t border-gray-100 px-6 py-5">
                            <p className="mb-3 text-sm font-semibold text-gray-900">Thông tin giao dịch</p>
                            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                <InfoText label="Mã tham chiếu" value={payment.transaction.reference} />
                                <InfoText label="Thời gian" value={payment.transaction.transactionDateTime} />
                                <InfoText label="Ngân hàng" value={getBankName(payment.transaction)} />
                                <InfoText label="Người chuyển" value={payment.transaction.counterAccountName} />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row">
                        <Link
                            to="/"
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                        >
                            <Home size={17} />
                            Về trang chủ
                        </Link>
                        <Link
                            to="/cart"
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                        >
                            <RotateCcw size={17} />
                            Quay lại giỏ hàng
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
            {Icon && <Icon size={14} />}
            <span>{label}</span>
        </div>
        <p className="mt-1 break-words text-sm font-medium text-gray-900">{value || "-"}</p>
    </div>
);

const InfoText = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-1 break-words text-gray-800">{value || "-"}</p>
    </div>
);
