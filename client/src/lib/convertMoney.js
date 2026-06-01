export const fmt = (n) =>
    Number(n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });