import React, { useEffect, useMemo, useRef, useState } from 'react'
import Container from '../../assets/Container.svg'
import heart from '../../assets/heart.svg'
import person from '../../assets/person.svg'
import logo from "../../assets/logo.png"
import { ChevronDown, ChevronUp, LayoutDashboard, LogOut, ShieldCheck, ShoppingBag, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthStore } from '@/stores/auth.store'
import { useCategory } from '@/hooks/category/useCategory'
import { CartStore } from '@/stores/cart.store'
// import { CartStore } from '@/stores/cart.store'
export const Header = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const { categories, isLoading, isValidating, refreshCategory } = useCategory()
    const { user, logout } = AuthStore()
    const { cartCount } = CartStore()
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const handleLogout = async () => {
        await logout();
        navigate("/");
    };
    // const categories = []
    return (
        <header className="header-root">
            <section className='header-container'>
                <a href="/" className="logo size-16">
                    <img src={logo} alt="logo" />
                </a>
                <nav>
                    <ul className='nav-list'>
                        <li>
                            <a href="/">Trang chủ</a>
                        </li>
                        {categories?.map((cat) => (
                            <li key={cat.id} className="nav-item group">
                                <button className="nav-button">
                                    {cat.name}
                                    <ChevronDown
                                        size={16}
                                        strokeWidth={2}
                                        className="icon-rotate"
                                    />
                                </button>
                                <div className="dropdown-menu">
                                    {cat.children.map((child, index) => (
                                        <div key={child.id} className="dropdown-column">
                                            {index > 0 && (
                                                <div className="dropdown-divider" />
                                            )}
                                            <div className="flex-1 min-w-[140px]">
                                                {child.slug && <p className="dropdown-title">
                                                    {child.name}
                                                </p>}
                                                <div className="flex flex-col gap-1">
                                                    {child.children.map((grandchild) => (
                                                        <Link to={`/product?category=${grandchild.slug}`}
                                                            key={grandchild.id}
                                                            href='#'
                                                            className="dropdown-link"
                                                        >
                                                            {grandchild.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                        <li>
                            <a href="#">Về chúng tôi</a>
                        </li>
                    </ul>
                </nav>
                <ul className='action-list'>
                    <li>
                        <a href="#">
                            <img src={heart} alt="heart" />
                        </a>
                    </li>
                    <li className=''>
                        <a href="cart" className='relative'>
                            <img src={Container} alt="Container" />
                            {cartCount ? <div className='absolute w-5 h-5 text-xs text-secondary font-semibolb rounded-full bg-blues-500 flex items-center justify-center -top-2 -right-3'>
                                <p >{cartCount}</p>
                            </div> : ""}
                        </a>
                    </li>
                    <li className='avatar-btn'>
                        {user ? <div ref={ref} className="relative">
                            <button
                                onClick={() => setOpen(prev => !prev)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 transition-colors bg-white"
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-[13px] font-medium text-gray-800">{user.name}</span>
                            </button>
                            {open && (
                                <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-white border border-gray-100 rounded-xl overflow-hidden z-50 shadow-sm">
                                    <div className="px-4 py-3.5 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                        {user.role === "ADMIN" && (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                                <ShieldCheck size={11} />
                                                Quản trị viên
                                            </span>
                                        )}
                                    </div>
                                    <div className="py-1">
                                        {user.role === "ADMIN" && (
                                            <>
                                                <MenuItem icon={<LayoutDashboard size={15} />} label="Trang quản trị" onClick={() => navigate("/admin/category")} />
                                                <div className="h-px bg-gray-100 my-1" />
                                            </>
                                        )}
                                        <MenuItem icon={<ShoppingBag size={15} />} label="Lịch sử đơn hàng" onClick={() => navigate("/orders")} />
                                        <MenuItem icon={<User size={15} />} label="Thông tin cá nhân" onClick={() => navigate("/profile")} />
                                        <div className="h-px bg-gray-100 my-1" />
                                        <MenuItem icon={<LogOut size={15} />} label="Đăng xuất" onClick={handleLogout} danger />
                                    </div>
                                </div>
                            )}
                        </div> : <a href="/sign-in" className='avatar-inner'>
                            <User size={16} color="#4A4A4A" strokeWidth={1.5} />
                        </a>}

                    </li>
                </ul>
            </section>
        </header >
    )
}
const MenuItem = ({ icon, label, onClick, danger }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] transition-colors
            ${danger
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
    >
        {icon}
        {label}
    </button>
);
