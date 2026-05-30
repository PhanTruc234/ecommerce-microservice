
import './App.css'
import { Toaster } from 'sonner'
import { AppRouter } from './routes/AppRouter'

function App() {
  // const { setCartFromServer } = CartStore()
  // const { user } = AuthStore()
  // useEffect(() => {
  //   if (!user) return
  //   const handleCallCart = async () => {
  //     const res = await cartService.getCarts()
  //     if (res?.carts) setCartFromServer(res?.carts)
  //   }
  //   handleCallCart()
  // }, [user?.id])
  return (
    <>
      <Toaster />
      <AppRouter />
    </>
  )
}

export default App
