import React from 'react'
import hero from "@/assets/hero-section.png"
export const HeroSection = () => {
    return (
        <section className='container mt-32 flex items-center gap-12 font-heading'>
            <div className='space-y-10'>
                <div className='space-y-6 pr-15'>
                    <p className='uppercase text-xs font-semibold border rounded-full py-2 px-4 inline-block border-primary tracking-[2px]'>new collection 2026</p>
                    <h1 className='title-hero'>Minimal Style Maximum Impact.</h1>
                    <p className='font-sans text-grays-700'>Khám phá bộ sưu tập mới dành cho giới trẻ hiện đại — từ tối giản tinh tế đến phong cách deluxe đầy cá tính.</p>
                </div>
                <div className='space-x-4'>
                    <button className='btn-primary'>
                        Mua ngay
                    </button>
                    <button className='btn-primary bg-transparent border border-primary text-primary '>
                        Explore Collection
                    </button>
                </div>
            </div>
            <div className='min-w-[520px] rounded-lg overflow-hidden'>
                <img src={hero} alt="hero" />
            </div>
        </section>
    )
}
