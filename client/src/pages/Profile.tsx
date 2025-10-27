import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User, Package, LogOut, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/services/supabase'
import type { Order } from '../../../shared/types'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, profile, signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)

      // Check if user exists
      if (!user) {
        setOrders([])
        setLoading(false)
        return
      }

      // Load orders for current user only
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Load order items for each order separately
      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map(order => order.id)
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)

        if (itemsError) throw itemsError

        // Attach items to orders
        const ordersWithItems = ordersData.map(order => ({
          ...order,
          items: itemsData?.filter(item => item.order_id === order.id) || []
        }))

        setOrders(ordersWithItems)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user, loadOrders])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400'
      case 'shipped':
        return 'text-blue-400'
      case 'processing':
        return 'text-yellow-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-1 gradient-text mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your account and view orders</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-6 space-y-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-accent-primary text-white'
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-accent-primary text-white'
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
              }`}
            >
              <Package className="w-5 h-5" />
              Orders
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-800 text-red-400 hover:bg-dark-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>

              <div className="space-y-6">
                {profile?.avatar_url && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-accent-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <div className="glass-card p-4">
                    <p className="text-white text-lg">
                      {profile?.full_name || 'Not set'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <div className="glass-card p-4">
                    <p className="text-white text-lg">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Role
                  </label>
                  <div className="glass-card p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      profile?.role === 'admin'
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {profile?.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Order History</h2>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No orders yet</p>
                  <p className="text-gray-500 text-sm">
                    Start shopping to see your orders here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Order ID</p>
                          <p className="text-white font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className={`font-semibold capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-dark-700 pt-4 mb-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Order Date</p>
                            <p className="text-white">{formatDate(order.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Total Amount</p>
                            <p className="text-2xl font-bold gradient-text">
                              ${Number(order.total_amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-dark-700 pt-4">
                          <p className="text-gray-400 text-sm mb-2">Items</p>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-300">
                                  {item.cocktail_name} × {item.quantity}
                                </span>
                                <span className="text-white font-semibold">
                                  ${Number(item.subtotal).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-dark-700 pt-4 mt-4">
                        <p className="text-gray-400 text-sm mb-1">Shipping Address</p>
                        <p className="text-white text-sm">
                          {order.shipping_address}, {order.city}, {order.postal_code}, {order.country}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
