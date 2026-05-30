import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export const LayoutAdmin = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.2s ease-linear' }}>
                <header className="flex h-16 items-center gap-2  border-b">
                    <span className='text-xl font-semibold'>Xin chào, Quản trị viên</span>
                </header>
                <main className='p-6'>
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
