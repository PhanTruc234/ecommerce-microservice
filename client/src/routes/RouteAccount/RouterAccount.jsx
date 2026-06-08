
import { LayoutAccount } from '@/components/layouts/LayoutAccount/LayoutAccount'
import { LoginForm } from '@/components/login-form'
import { SignupForm } from '@/components/signup-form'
import { CartPage } from '@/pages/AccountPage/Cart/CartPage'
import { CheckoutPage } from '@/pages/AccountPage/Checkout/CheckoutPage'
import { HomePage } from '@/pages/AccountPage/HomePage'
import { PaymentPage } from '@/pages/AccountPage/Payment/PaymentPage'
import { ProductDetail } from '@/pages/AccountPage/Product/ProductDetai'
import { ProductList } from '@/pages/AccountPage/Product/ProductList'



export const accountRoutes = [
    {
        path: '/',
        element: <LayoutAccount />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'sign-in', element: <LoginForm /> },
            { path: 'sign-up', element: <SignupForm /> },
            // { path: 'profile', element: <InfoPersonalPage /> },
            // { path: 'profile/edit', element: <EditProfile /> },
            { path: 'product', element: <ProductList /> },
            { path: 'product/:slug', element: <ProductDetail /> },
            { path: "cart", element: <CartPage /> },
            { path: "checkout", element: <CheckoutPage /> },
            {
                path: "payment/success",
                element: <PaymentPage />
            },
            {
                path: "payment/cancel",
                element: <PaymentPage />
            },
            {
                path: "payment/cancel",
                element: <PaymentPage />
            },
            // { path: "orders", element: <MyOrderPage /> }
        ],
    },
]
