import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Package, Droplet, Wine } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { useCart } from '@/contexts/CartContext'
import type { Cocktail, Category } from '../../../shared/types'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Cocktail | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cocktails')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        toast.error('Product not found')
        navigate('/products')
        return
      }

      setProduct(data)

      // Load category separately if it exists
      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', data.category_id)
          .single()

        if (categoryData) {
          setCategory(categoryData)
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Failed to load product')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    if (product.stock < quantity) {
      toast.error('Not enough stock available')
      return
    }

    try {
      setAddingToCart(true)
      await addToCart(product, quantity)
      setQuantity(1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
    }
  }

  if (loading) {
    return (
      <div className="section-container flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="section-container">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link to="/products">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </button>
        </Link>
      </motion.div>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative glass-card overflow-hidden">
            <img
              src={product.image_url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
            {product.is_featured && (
              <span className="absolute top-4 right-4 px-4 py-2 bg-accent-primary text-white font-semibold rounded-full shadow-glow">
                Featured
              </span>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          {/* Category */}
          {category && (
            <p className="text-accent-primary text-sm font-semibold mb-2">
              {category.name}
            </p>
          )}

          {/* Name */}
          <h1 className="heading-1 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="text-4xl font-bold gradient-text mb-6">
            ${Number(product.price).toFixed(2)}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Product Details */}
          <div className="glass-card p-6 mb-8 space-y-4">
            {product.alcohol_content !== null && product.alcohol_content !== undefined && (
              <div className="flex items-center gap-3">
                <Wine className="w-5 h-5 text-accent-primary" />
                <div>
                  <p className="text-gray-400 text-sm">Alcohol Content</p>
                  <p className="text-white font-semibold">{product.alcohol_content}%</p>
                </div>
              </div>
            )}

            {product.volume_ml && (
              <div className="flex items-center gap-3">
                <Droplet className="w-5 h-5 text-accent-primary" />
                <div>
                  <p className="text-gray-400 text-sm">Volume</p>
                  <p className="text-white font-semibold">{product.volume_ml}ml</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-accent-primary" />
              <div>
                <p className="text-gray-400 text-sm">Stock</p>
                <p className="text-white font-semibold">
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-dark-800 border border-dark-700 rounded-full text-sm text-gray-300"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          {product.stock > 0 ? (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </motion.button>
            </div>
          ) : (
            <div className="glass-card p-4 text-center">
              <p className="text-gray-400">This product is currently out of stock</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ProductDetail
