import React from 'react'
import { Outlet } from 'react-router-dom'
import { AuthStore } from '@/stores/auth.store'
import { Header } from '../Header'
import { Footer } from '../Footer'

export const LayoutAccount = () => {
    const { user } = AuthStore()
    return (
        <>
            <Header />
            <main className='flex-1'>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
