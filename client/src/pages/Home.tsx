import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react'
import { supabase } from '@/services/supabase'
import type { Cocktail } from '../../../shared/types'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('cocktails')
        .select('*')
        .eq('is_featured', true)
        .eq('is_available', true)
        .limit(3)

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error loading featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
        <div className="section-container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-semibold border border-accent-primary/20">
                  ✨ Premium Cocktails
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="heading-1 mb-6"
              >
                Experience <span className="gradient-text">Luxury</span> in
                <br />
                Every Sip
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-300 mb-8"
              >
                Discover our curated collection of premium cocktails and spirits,
                crafted to perfection and delivered to your door.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/products?category=cocktails">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary"
                  >
                    Browse Cocktails
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800"
                  alt="Premium Cocktail"
                  className="rounded-2xl shadow-glow-lg"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-accent-tertiary/20 rounded-2xl blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-container">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: 'Premium Quality',
              description: 'Hand-selected premium ingredients and spirits',
            },
            {
              icon: TrendingUp,
              title: 'Expert Mixologists',
              description: 'Crafted by award-winning bartenders',
            },
            {
              icon: Shield,
              title: 'Secure Delivery',
              description: 'Safe and fast delivery to your door',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 hover:shadow-glow transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-accent-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="heading-2 mb-4">
            <span className="gradient-text">Featured</span> Cocktails
          </h2>
          <p className="text-gray-400">Discover our most popular selections</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/products/${product.id}`}>
                  <div className="product-card">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold gradient-text">
                          ${product.price}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-primary"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              View All Products
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
