import React from 'react'
import { HeroSection } from './HeroSection'
import { CategorySection } from './Category/CategorySection'
import { FeatureProduct } from './Product/FeatureProduct'
export const HomePage = () => {
    return (
        <>
            <HeroSection />
            <CategorySection />
            <FeatureProduct />
            {/* <Service />
            <CategorySection />
            <FeatureProduct />
            <FlashSale />
            <OurStory /> */}
        </>
    )
}
