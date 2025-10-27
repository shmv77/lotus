import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import type { Cocktail, Category, ProductFilters } from '../../../shared/types'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Cocktail[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'newest',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

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

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      console.log('Loading products with filters:', filters)

      let query = supabase
        .from('cocktails')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_available', true)

      // Apply category filter by joining and filtering
      if (filters.category && categories.length > 0) {
        const category = categories.find(c => c.slug === filters.category)
        if (category) {
          query = query.eq('category_id', category.id)
        }
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'name_asc':
          query = query.order('name', { ascending: true })
          break
        case 'name_desc':
          query = query.order('name', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      console.log('Executing query...')
      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Products loaded:', data?.length || 0)
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, categories])

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)

    // Update URL params
    const params = new URLSearchParams()
    if (updated.category) params.set('category', updated.category)
    if (updated.search) params.set('search', updated.search)
    if (updated.sortBy) params.set('sortBy', updated.sortBy)
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({ sortBy: 'newest' })
    setSearchParams({})
  }

  const hasActiveFilters = filters.category || filters.search

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-1 gradient-text mb-4">Products</h1>
        <p className="text-gray-400">Explore our premium collection of cocktails and spirits</p>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">Categories</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters({ category: undefined })}
                className={`px-4 py-2 rounded-lg transition-all ${
                  !filters.category
                    ? 'bg-accent-primary text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFilters({ category: category.slug })}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filters.category === category.slug
                      ? 'bg-accent-primary text-white'
                      : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort and Clear */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as ProductFilters['sortBy'] })}
                className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-accent-primary hover:text-accent-secondary transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-400 text-lg">No products found matching your criteria.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/products/${product.id}`}>
                <div className="product-card h-full flex flex-col">
                  <div className="relative">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                    />
                    {product.is_featured && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-accent-primary text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    {product.category && (
                      <p className="text-accent-primary text-xs font-semibold mb-2">
                        {product.category.name}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold gradient-text">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default Products
