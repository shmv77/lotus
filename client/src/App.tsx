import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-dark-950">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-dark-800 text-white border border-dark-700',
              duration: 3000,
            }}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
