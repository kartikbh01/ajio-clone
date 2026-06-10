import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { ThemeProvider } from "./components/theme-provider"
import HomePage from "./pages/HomePage"
import ProductListingPage from "./pages/ProductListingPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import WishlistPage from "./pages/WishlistPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderSuccessPage from "./pages/OrderSuccessPage"
import OrdersPage from "./pages/OrdersPage"
import { Navbar } from "./components/navbar/Navbar"
import { Footer } from "./components/common/Footer"
import { ScrollToTop } from "./components/common/ScrollToTop"


function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ajio-theme">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/products" element={<Layout><ProductListingPage /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
          <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/order-success/:orderId" element={<Layout><OrderSuccessPage /></Layout>} />
          <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  )
}

export default App

