
import { LayoutAdmin } from "@/components/layouts/LayoutAdmin/LayoutAdmin"
import { ProtectAdminRouter } from "../ProtectRouter/ProtectRouter"
import { CategoryPage } from "@/pages/AdminPage/Category/CategoryPage"
import { BrandPage } from "@/pages/AdminPage/Brand/BrandPage"
import { ProductPage } from "@/pages/AdminPage/Product/ProductPage"
import { ProductForm } from "@/pages/AdminPage/Product/ProductForm"
import { ProductEdit } from "@/pages/AdminPage/Product/ProductEdit"
import { OrderPage } from "@/pages/AdminPage/Order/OrderPage"

export const adminRoutes = [
    {
        path: '/admin',
        element: <ProtectAdminRouter />,
        children: [
            {
                element: <LayoutAdmin />,
                children: [
                    // { index: true, element: <DashboardPage /> },
                    { path: 'category', element: <CategoryPage /> },
                    { path: 'category/:parentId', element: <CategoryPage /> },
                    // { path: 'media', element: <MediaPage /> },
                    { path: 'brand', element: <BrandPage /> },
                    {
                        path: "product",
                        element: <ProductPage />,
                        children: [
                            { path: "add", element: <ProductForm /> },
                            { path: "edit/:id", element: <ProductEdit /> }
                        ]
                    },
                    // { path: "discount", element: <DiscountPage /> },
                    // { path: "chat", element: <AdminChatPage /> },
                    { path: "order", element: <OrderPage /> },
                    // { path: "user", element: <UserPage /> }
                ]
            }
        ]
    }
]