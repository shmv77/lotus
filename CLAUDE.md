# Lotus Cocktail E-Commerce Store - Architecture & Codebase Guide

## Quick Overview

Lotus is a modern full-stack e-commerce platform for premium cocktails. Monorepo: React/TypeScript frontend, Express/TypeScript backend, PostgreSQL (Supabase), Stripe integration.

Status: Backend 100%, Frontend 70% (6 page placeholders remain)

## 1. Tech Stack

### Frontend
React 18 | TypeScript | Vite | Tailwind CSS | Framer Motion | React Router v6 | Supabase | Stripe Elements

Dev server: http://localhost:5173

### Backend
Express.js | TypeScript | Supabase Admin | Stripe SDK | Helmet | CORS | Morgan | Express Validator | Rate Limit

Dev server: http://localhost:3000

### Database
PostgreSQL via Supabase with RLS, triggers, real-time, full-text search

## 2. Project Structure

client/
- src/components/ (layout, auth)
- src/contexts/ (AuthContext, CartContext)
- src/pages/ (9 components: 3 complete, 6 placeholders)
- src/services/ (supabase.ts)
- src/styles/ (index.css with design system)
- vite.config.ts, tsconfig.json, tailwind.config.js

server/
- src/controllers/ (auth, products, cart, orders, payments, admin)
- src/routes/ (mirror controllers)
- src/middleware/ (auth.ts, validation.ts)
- src/services/ (supabase.ts)
- tsconfig.json

shared/
- types/index.ts (shared TypeScript types)

supabase/
- migrations/001_initial_schema.sql
- seed.sql

## 3. Architecture

### Frontend
AuthContext: User state, authentication, profile, roles
CartContext: Shopping cart, operations, real-time updates
Routes: /, /products, /products/:id, /cart, /login, /register, /checkout (protected), /profile (protected), /admin/* (admin only)

### Backend
Middleware: Helmet → CORS → Morgan → JSON → Rate Limit → Auth → Routes
Pattern: Controller (logic) + Route (endpoint) per feature
Auth: JWT Bearer token → Supabase verification → User ID + role → RLS enforcement

### Database
7 tables: profiles, categories, cocktails, cart_items, orders, order_items, reviews
RLS: Users access own, admins access all
Triggers: Auto-timestamps, auto-profile on signup
Indexes: category, featured, status queries

### Authentication
User signup/login → Supabase Auth → JWT token in localStorage
API requests: Bearer token header → Backend verifies with Supabase
RLS policies enforce database row-level access
Roles: user (default), admin (manual in Supabase)

## 4. Commands

Root:
- npm run dev (client + server)
- npm run dev:client / npm run dev:server
- npm run build / npm run build:client / npm run build:server
- npm run install:all

Frontend (client/):
- npm run dev (Vite with HMR)
- npm run build (TypeScript + Vite to dist/)
- npm run lint

Backend (server/):
- npm run dev (tsx watch)
- npm run build (TypeScript to dist/)
- npm run start
- npm run lint

## 5. Database Setup

1. Create Supabase project
2. Copy supabase/migrations/001_initial_schema.sql to SQL Editor
3. Execute
4. Optional: Run seed.sql
5. RLS auto-enabled in migration

Schema: 7 tables | UUIDs | timestamps | constraints | indexes | triggers
RLS: Users own data only, admins all, public read products (is_available=true)

## 6. Data Flow

Add to Cart:
User → CartContext.addToCart() → Supabase insert → RLS check → Context refetch → State update → Re-render

Purchase:
Form → POST /api/orders → POST /api/payments/intent (Stripe) → Stripe Elements → Payment → Webhook → Status update → Success

API:
Frontend: Bearer token in Authorization header
Backend: authMiddleware verifies token, extracts user ID + role
Database: RLS policies enforce access

## 7. Design System

Classes: .glass-card | .gradient-text | .btn-primary/.secondary/.ghost | .input-field | .product-card | .neon-border | .section-container | .heading-1/2/3

Colors:
Dark: #0a0a0f (950), #1f1f2e (800), #2a2a3e (700)
Accents: #e94560 (pink), #ff6b9d (light), #c77dff (purple), #ffd700 (gold)

Animations (Framer Motion):
initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

## 8. Environment Variables

Client (.env):
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY, VITE_API_URL=http://localhost:3000

Server (.env):
PORT=3000, NODE_ENV=development, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL=http://localhost:5173

## 9. Type Safety

Shared types (shared/types/index.ts): User, Profile, Cocktail, Category, CartItem, Order, OrderItem, Review

TypeScript: Strict mode, no unused locals/params, path aliases

Naming: Components (PascalCase), Utils (camelCase), Folders (lowercase)
Imports: Always use aliases (@/services)

## 10. Key Files

Understanding:
- client/src/App.tsx (Router)
- client/src/contexts/AuthContext.tsx (Auth)
- client/src/contexts/CartContext.tsx (Cart)
- server/src/index.ts (Server)
- server/src/middleware/auth.ts (Token verify)
- supabase/migrations/001_initial_schema.sql (DB)
- shared/types/index.ts (Types)

Examples:
- client/src/pages/Home.tsx (React + Motion)
- client/src/pages/Login.tsx (Forms + Auth)
- server/src/controllers/products.ts (Controller)
- server/src/routes/auth.ts (Routes)
- client/src/components/layout/Navbar.tsx (Layout)

## 11. Remaining Work

Frontend pages (6 placeholders):
1. Products.tsx (grid, filtering)
2. ProductDetail.tsx (product info)
3. Cart.tsx (cart items)
4. Checkout.tsx (shipping + payment)
5. Profile.tsx (user info, orders)
6. admin/AdminDashboard.tsx (admin panel)

Use Home.tsx and Login.tsx as patterns

Backend: 100% complete

## 12. Quick Start

1. npm run dev
2. Review Home.tsx, Login.tsx patterns
3. Implement 6 remaining pages
4. Test with seed data
5. Connect Stripe webhook

Production-ready: Secure auth, Complete API, PostgreSQL+RLS, Stripe, Dark theme, TypeScript throughout.
