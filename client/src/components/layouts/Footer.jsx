import insta from "../../assets/instagram.svg"
import face from "../../assets/face.svg"
import TT from "../../assets/TT.svg"
import logo from "../../assets/logo.png"
import { Mail, Phone } from "lucide-react";
export const Footer = () => {
    return (
        <footer className="bg-primary text-secondary mt-20">
            <div className="border-b border-white/10 py-16 text-center">
                <h2 className="text-4xl font-bold mb-3">Stay Updated</h2>
                <p className="text-sm text-grays-700 mb-8 max-w-md mx-auto leading-relaxed">
                    Đăng ký nhận bản tin để cập nhật bộ sưu tập mới, ưu đãi độc quyền và xu hướng mới nhất từ M2TD.
                </p>
                <div className="flex max-w-md mx-auto mb-3">
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="flex-1 bg-white/5 border border-white/10 text-secondary placeholder:text-grays-700 px-4 h-12 rounded-l-lg text-sm outline-none focus:border-white/30 transition-colors"
                    />
                    <button className="bg-blues-500 hover:bg-blue-600 text-white px-6 h-12 rounded-r-lg text-sm font-medium transition-colors whitespace-nowrap">
                        Subscribe
                    </button>
                </div>
                <p className="text-sm text-greens-500">Get 10% off your first order.</p>
            </div>

            <div className="container grid grid-cols-4 gap-8 py-12">

                <div className="flex flex-col">
                    <a href="/" className="block">
                        <img
                            src={logo}
                            alt="M2TD logo"
                            className="w-20 h-20 object-contain"
                        />
                    </a>
                    <p className="text-sm text-grays-700 leading-relaxed max-w-[220px]">
                        Minimal To Deluxe — thời trang tối giản hiện đại dành cho giới trẻ 18–30.
                    </p>
                    <div className="flex items-center gap-2 mb-2.5">
                        <Phone size={14} className="text-grays-700 shrink-0" />
                        <span className="text-sm text-grays-700">1900 6868</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-grays-700 shrink-0" />
                        <span className="text-sm text-grays-700">hello@m2td.com</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-4">Quick Links</p>
                    {["Home", "Men", "Women", "Shoes", "Accessories", "Sale"].map(link => (
                        <a
                            key={link}
                            href="#"
                            className="block text-sm text-grays-700 hover:text-secondary mb-2.5 transition-colors"
                        >
                            {link}
                        </a>
                    ))}
                </div>

                <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-4">Customer Support</p>
                    {["Return Policy", "Shipping Info", "Size Guide", "FAQ", "Terms & Conditions"].map(link => (
                        <a
                            key={link}
                            href="#"
                            className="block text-sm text-grays-700 hover:text-secondary mb-2.5 transition-colors"
                        >
                            {link}
                        </a>
                    ))}
                </div>

                <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-4">Follow Us</p>
                    <div className="flex gap-2.5">
                        <button className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center transition-colors">
                            <img src={face} alt="Facebook" className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center transition-colors">
                            <img src={insta} alt="Instagram" className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center transition-colors">
                            <img src={TT} alt="TikTok" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-5 text-center">
                <p className="text-sm text-grays-700">
                    © 2026 M2TD — Minimal To Deluxe. All rights reserved.
                </p>
            </div>
        </footer >
    );
};