// User types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  image_url?: string
  created_at: string
}

// Cocktail types
export interface Cocktail {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category_id: string
  category?: Category
  ingredients: string[]
  alcohol_content?: number
  volume_ml?: number
  stock: number
  is_featured: boolean
  is_available: boolean
  created_at: string
  updated_at: string
  average_rating?: number
  reviews_count?: number
}

export interface CreateCocktailInput {
  name: string
  description: string
  price: number
  image_url?: string
  category_id: string
  ingredients: string[]
  alcohol_content?: number
  volume_ml?: number
  stock: number
  is_featured?: boolean
  is_available?: boolean
}

export interface UpdateCocktailInput {
  name?: string
  description?: string
  price?: number
  image_url?: string
  category_id?: string
  ingredients?: string[]
  alcohol_content?: number
  volume_ml?: number
  stock?: number
  is_featured?: boolean
  is_available?: boolean
}

// Cart types
export interface CartItem {
  id: string
  user_id: string
  cocktail_id: string
  cocktail?: Cocktail
  quantity: number
  created_at: string
  updated_at: string
}

export interface AddToCartInput {
  cocktail_id: string
  quantity: number
}

export interface UpdateCartItemInput {
  quantity: number
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_address: string
  city: string
  postal_code: string
  country: string
  phone: string
  payment_intent_id?: string
  payment_status: PaymentStatus
  notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  cocktail_id?: string
  cocktail_name: string
  cocktail_price: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface CreateOrderInput {
  shipping_address: string
  city: string
  postal_code: string
  country: string
  phone: string
  notes?: string
}

export interface UpdateOrderStatusInput {
  status: OrderStatus
}

// Review types
export interface Review {
  id: string
  cocktail_id: string
  user_id: string
  user?: Profile
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface CreateReviewInput {
  cocktail_id: string
  rating: number
  comment?: string
}

// Auth types
export interface SignUpInput {
  email: string
  password: string
  full_name?: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface UpdateProfileInput {
  full_name?: string
  avatar_url?: string
}

// Payment types
export interface PaymentIntentResponse {
  clientSecret: string
  amount: number
}

export interface CreatePaymentIntentInput {
  order_id: string
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Analytics types
export interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: Array<{
    cocktail: Cocktail
    totalSold: number
    revenue: number
  }>
}

// Filter types
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  is_featured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'
}
