import { Request, Response } from 'express'
import supabaseAdmin from '../services/supabase.js'

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const offset = (page - 1) * limit

    const { data: products, error, count } = await supabaseAdmin
      .from('cocktails')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_available', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get products error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { data: product, error } = await supabaseAdmin
      .from('cocktails')
      .select('*, category:categories(*), reviews(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    res.json({ data: product })
  } catch (error: any) {
    console.error('Get product error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const offset = (page - 1) * limit

    const { data: products, error, count } = await supabaseAdmin
      .from('cocktails')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get products by category error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query

    if (!q) {
      res.status(400).json({ error: 'Search query is required' })
      return
    }

    const { data: products, error } = await supabaseAdmin
      .from('cocktails')
      .select('*, category:categories(*)')
      .ilike('name', `%${q}%`)
      .eq('is_available', true)
      .order('name')

    if (error) throw error

    res.json({ data: products })
  } catch (error: any) {
    console.error('Search products error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error

    res.json({ data: categories })
  } catch (error: any) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: error.message })
  }
}
