import dayjs from "dayjs"

export const formatDate = (value) => {
    if (!value) return "Chưa cập nhật"
    return dayjs(value).format("DD/MM/YYYY HH:mm")
}