import { AuthStore } from '@/stores/auth.store'
import { Home, Mail, MapPin, PencilLine, Phone, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const EMPTY_VALUE = 'Chưa cập nhật'
export const InfoPersonalPage = () => {
    const { user } = AuthStore()
    const isAdmin = user?.role === 'ADMIN'
    const profileItems = [
        { icon: <Mail size={18} />, label: 'Email', value: user?.email },
        { icon: <Phone size={18} />, label: 'Số điện thoại', value: user?.phone },
        { icon: <MapPin size={18} />, label: 'Tỉnh / Thành phố', value: user?.province },
        { icon: <MapPin size={18} />, label: 'Phường / Xã', value: user?.ward },
        { icon: <Home size={18} />, label: 'Địa chỉ chi tiết', value: user?.address, wide: true },
    ]
    return (
        <section className="container bg-secondary mt-32 pb-16">
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blues-500">
                        Tài khoản của tôi
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-gray-950">
                        Thông tin cá nhân
                    </h1>
                </div>
                <Link to={"edit"}
                    type="button"
                    className='flex items-center gap-2 btn-primary p-2'
                >
                    <PencilLine size={17} />
                    Chỉnh sửa
                </Link>
            </div>
            <div className="flex justify-center items-center flex-col">
                <div className="w-20 rounded-full overflow-hidden shadow-xl">
                    {user?.avatar && (
                        <img
                            src={user.avatar}
                            alt={user?.name || 'Avatar'}
                            className=""
                        />
                    )}
                </div>
                <div className="">
                    <h2 className="text-3xl font-semibold leading-tight text-primary">
                        {user?.name || EMPTY_VALUE}
                    </h2>
                    {isAdmin && (
                        <span className="flex items-center gap-2 justify-center">
                            <ShieldCheck size={14} />
                            Quản trị viên
                        </span>
                    )}
                </div>
            </div>
            <div className="grid gap-4 p-5 sm:p-8 md:grid-cols-2">
                {profileItems.map((item) => (
                    <InfoRow
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                        wide={item.wide}
                    />
                ))}
            </div>
        </section>
    )
}
const InfoRow = ({ icon, label, value, wide }) => {
    const isEmpty = !value
    return (
        <div className={`flex min-h-[92px] items-start gap-4 rounded-xl border border-gray-100 bg-[#fbfbf8] px-4 py-4 transition hover:border-emerald-100 hover:bg-white ${wide ? 'md:col-span-2' : ''}`}>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-blues-500 shadow-sm ring-1 ring-gray-100">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    {label}
                </p>
                <p className={`mt-1.5 break-words text-sm font-semibold ${isEmpty ? 'text-gray-400' : 'text-gray-950'}`}>
                    {value || EMPTY_VALUE}
                </p>
            </div>
        </div>
    )
}















