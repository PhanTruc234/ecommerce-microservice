import { useProducts } from '@/hooks/product/useProduct'
import { Heart, MoveLeft, MoveRight } from 'lucide-react'
import React, { useRef } from 'react'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Link } from 'react-router-dom'
import SlickSlider from "react-slick"
import { fmt } from '@/lib/convertMoney'

export const FeatureProduct = () => {
    const Slider = SlickSlider.default
    const { products, isLoading, refreshProducts } = useProducts({ limit: 10 })
    const sliderRef = useRef(null)
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 900, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ]
    }
    const handlePrev = () => sliderRef.current.slickPrev()
    const handleNext = () => sliderRef.current.slickNext()

    if (isLoading) return null
    console.log(products, "productsproducts")
    return (
        <div className='bg-grays-500'>
            <div className='py-20 relative group/slider container'>
                <div>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-[36px] font-bold'>Sản phẩm nổi bật</h2>
                        <a href="" className='mb-12 text-[18px] font-light text-[#1B1B1B]'>
                            Xem tất cả
                        </a>
                    </div>

                    <Slider {...settings} ref={sliderRef}>
                        {products?.products?.map((product) => {
                            const thumbnail = product.productImages?.find((thum) => thum.isMain)
                            const minPrice = Math.min(...product.variants?.map(v => Number(v.price)));
                            const minBasePrice = Math.min(...product.variants?.map(v => Number(v.price)));
                            return (
                                <div key={product.id} className=''>
                                    <div className=' bg-white rounded-2xl relative group border border-[#D3D3D3] mx-3'>
                                        <div
                                            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center absolute top-4 right-4 translate-x-14 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-500 z-20"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                // handleAddWish(product.id)
                                            }}
                                        >
                                            <Heart size={20} />
                                        </div>

                                        <Link to={`/product/${product.id}-${product.slug}`}>
                                            <div className="rounded-2xl overflow-hidden">
                                                <div className='w-full h-[300px]'>
                                                    <img
                                                        src={thumbnail.thumbnail}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className='space-y-2 p-4'>
                                                    <div>
                                                        <p className='text-primary text-sm'>{product.brand?.name}</p>
                                                        <p className='text-[18px] font-semibold line-clamp-1'>{product.name}</p>
                                                    </div>
                                                    <div className='flex items-center gap-3'>
                                                        <p className='font-semibold text-red-500'>
                                                            {fmt(minPrice ?? minBasePrice)}
                                                        </p>
                                                    </div>
                                                    <div className='btn p-2 bg-primary text-secondary transition-all duration-500 ease-in-out cursor-pointer inline-flex'>
                                                        Xem chi tiết
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </Slider>
                </div>
                <div
                    onClick={handlePrev}
                    className="absolute top-1/2 left-6 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-title cursor-pointer opacity-0 group-hover/slider:opacity-100 transition-all"
                >
                    <MoveLeft className="size-6" />
                </div>
                <div
                    onClick={handleNext}
                    className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-title cursor-pointer opacity-0 group-hover/slider:opacity-100 transition-all"
                >
                    <MoveRight className="size-6" />
                </div>
            </div>
        </div>
    )
}