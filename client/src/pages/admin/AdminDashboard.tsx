import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Link } from 'react-router-dom'
import type { Order, Cocktail, Category } from '../../../../shared/types'
import toast from 'react-hot-toast'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  recentOrders: Order[]
}

interface ProductFormData {
  name: string
  description: string
  price: string
  image_url: string
  category_id: string
  alcohol_content: string
  volume_ml: string
  stock: string
  is_featured: boolean
  is_available: boolean
  ingredients: string
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [],
  })
  const [products, setProducts] = useState<Cocktail[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    alcohol_content: '',
    volume_ml: '',
    stock: '0',
    is_featured: false,
    is_available: true,
    ingredients: '[]'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDashboardData()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Load order items separately
      let ordersWithItems = ordersData || []
      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map(order => order.id)
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)

        if (itemsError) throw itemsError

        // Attach items to orders
        ordersWithItems = ordersData.map(order => ({
          ...order,
          items: itemsData?.filter(item => item.order_id === order.id) || []
        }))
      }

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('cocktails')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      // Calculate stats
      const totalRevenue = ordersWithItems.reduce((sum, order) =>
        sum + Number(order.total_amount), 0
      ) || 0

      setStats({
        totalRevenue,
        totalOrders: ordersWithItems.length || 0,
        totalProducts: productsData?.length || 0,
        recentOrders: ordersWithItems.slice(0, 10) || [],
      })

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('cocktails')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Product deleted successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Order status updated')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)

      // Parse ingredients JSON
      let ingredientsJson = []
      try {
        ingredientsJson = JSON.parse(formData.ingredients)
      } catch {
        ingredientsJson = []
      }

      const { data, error } = await supabase
        .from('cocktails')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url || null,
          category_id: formData.category_id,
          alcohol_content: formData.alcohol_content ? parseFloat(formData.alcohol_content) : null,
          volume_ml: formData.volume_ml ? parseInt(formData.volume_ml) : null,
          stock: parseInt(formData.stock),
          is_featured: formData.is_featured,
          is_available: formData.is_available,
          ingredients: ingredientsJson
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Product created successfully!')
      setShowCreateModal(false)
      resetForm()
      loadDashboardData()
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error(error.message || 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      alcohol_content: '',
      volume_ml: '',
      stock: '0',
      is_featured: false,
      is_available: true,
      ingredients: '[]'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400'
      case 'shipped': return 'bg-blue-500/20 text-blue-400'
      case 'processing': return 'bg-yellow-500/20 text-yellow-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="section-container flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-1 gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage your store and monitor performance</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-accent-primary text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'products'
              ? 'bg-accent-primary text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'bg-accent-primary text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          Orders
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold gradient-text">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Products</p>
              <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-white">
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </p>
            </motion.div>
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-semibold mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left text-gray-400 text-sm font-semibold pb-3">Order ID</th>
                    <th className="text-left text-gray-400 text-sm font-semibold pb-3">Date</th>
                    <th className="text-left text-gray-400 text-sm font-semibold pb-3">Status</th>
                    <th className="text-right text-gray-400 text-sm font-semibold pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-dark-800">
                      <td className="py-4 text-sm font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-4 text-sm">{formatDate(order.created_at)}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Product Management</h2>
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-sm">
                Total: {products.length} products
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Product
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-dark-800 border border-dark-700 rounded-lg p-4 hover:border-dark-600 transition-colors"
              >
                <div className="flex gap-4">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold mb-1">{product.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-1 mb-2">
                          {product.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-accent-primary font-bold">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          <span className="text-gray-400">
                            Stock: {product.stock}
                          </span>
                          {product.is_featured && (
                            <span className="text-yellow-400">Featured</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/products/${product.id}`}>
                          <button className="p-2 bg-dark-700 hover:bg-dark-600 rounded transition-colors">
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">Order Management</h2>

          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-dark-800 border border-dark-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-2">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 bg-dark-700 border border-dark-600 rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-xl font-bold gradient-text">
                      ${Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Payment</p>
                    <p className={`font-semibold ${
                      order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {order.payment_status}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="border-t border-dark-700 pt-4">
                    <p className="text-gray-400 text-sm mb-2">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
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
                  <p className="text-gray-400 text-sm">Shipping Address</p>
                  <p className="text-white text-sm">
                    {order.shipping_address}, {order.city}, {order.postal_code}, {order.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Product Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold gradient-text">Create New Product</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Product Name <span className="text-accent-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., Mojito"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description <span className="text-accent-primary">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full min-h-[100px]"
                    placeholder="Describe the product..."
                  />
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Price ($) <span className="text-accent-primary">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field w-full"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Category <span className="text-accent-primary">*</span>
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Alcohol Content, Volume, Stock */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Alcohol %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.alcohol_content}
                      onChange={(e) => setFormData({ ...formData, alcohol_content: e.target.value })}
                      className="input-field w-full"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Volume (ml)
                    </label>
                    <input
                      type="number"
                      value={formData.volume_ml}
                      onChange={(e) => setFormData({ ...formData, volume_ml: e.target.value })}
                      className="input-field w-full"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Stock <span className="text-accent-primary">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field w-full"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ingredients (JSON Array)
                  </label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="input-field w-full font-mono text-sm min-h-[80px]"
                    placeholder='["Rum", "Mint", "Sugar", "Lime", "Soda Water"]'
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter as a JSON array, e.g., ["ingredient1", "ingredient2"]
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-dark-600"
                    />
                    <span className="text-sm">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-dark-600"
                    />
                    <span className="text-sm">Available for Sale</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDashboard
