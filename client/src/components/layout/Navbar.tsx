import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { motion } from 'framer-motion'

const Navbar = () => {
  const { user, profile, signOut } = useAuth()
  const { getCartCount } = useCart()
  const navigate = useNavigate()
  const cartCount = getCartCount()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-card sticky top-0 z-50 border-b border-dark-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-display font-bold gradient-text"
            >
              LOTUS
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              to="/products?category=cocktails"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Cocktails
            </Link>
            <Link
              to="/products?category=spirits"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Spirits
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-accent-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                {profile?.role === 'admin' && (
                  <Link to="/admin">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard className="w-5 h-5 text-gray-300" />
                    </motion.button>
                  </Link>
                )}
                <Link to="/profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-300" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-gray-300" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-ghost"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
