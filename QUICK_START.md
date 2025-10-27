# Quick Start Guide - Lotus Cocktail Store

## 🚀 Get Running in 5 Steps

### 1. Install Dependencies (2 minutes)
```bash
cd D:\nrjApp\lotus
npm install
npm run install:all
```

### 2. Create Supabase Project (5 minutes)
1. Go to https://supabase.com → New Project
2. SQL Editor → New Query
3. Copy/paste content from `supabase/migrations/001_initial_schema.sql`
4. Click RUN
5. (Optional) Run `supabase/seed.sql` for sample cocktails

### 3. Add Environment Variables (2 minutes)

**client/.env** (copy from client/.env.example):
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

**server/.env** (copy from server/.env.example):
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

Get Supabase keys from: Settings → API
Get Stripe keys from: https://dashboard.stripe.com/test/apikeys

### 4. Run the App (1 minute)
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 5. Test It (2 minutes)
1. Go to http://localhost:5173
2. Click "Sign Up" → Create account
3. You should see the home page with featured products

## ✅ What Works Out of the Box

- ✅ User registration and login
- ✅ Home page with featured products
- ✅ Beautiful dark theme with animations
- ✅ Navigation with cart badge
- ✅ Protected routes
- ✅ Full backend API
- ✅ Database with sample data

## ⚠️  What Needs Implementation

**6 Pages need to be built** (have placeholder code):
- Products page (product grid + filters)
- ProductDetail page (product info + add to cart)
- Cart page (cart items list)
- Checkout page (payment form)
- Profile page (user info + orders)
- Admin Dashboard (product management)

**Use Login.tsx and Home.tsx as templates!**

## 🎨 Design System Quick Reference

### Pre-built Components
```tsx
// Buttons
<button className="btn-primary">Click Me</button>
<button className="btn-secondary">Secondary</button>

// Cards
<div className="glass-card p-6">Content</div>
<div className="product-card">Product</div>

// Inputs
<input className="input-field" placeholder="Email" />

// Headings
<h1 className="heading-1 gradient-text">Title</h1>
```

### Animations
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

## 🔧 Common Commands

```bash
# Start everything
npm run dev

# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server

# Build for production
npm run build

# Install new package in client
npm install package-name --workspace=client

# Install new package in server
npm install package-name --workspace=server
```

## 🆘 Quick Troubleshooting

**No products showing on home page?**
- Run the seed.sql file in Supabase
- Check browser console for errors
- Verify VITE_SUPABASE_URL in client/.env

**Can't login?**
- Check that migration SQL was run
- Verify Supabase keys are correct
- Check server console for errors

**CORS errors?**
- Verify CLIENT_URL in server/.env = http://localhost:5173

## 📚 Documentation Files

- `README.md` - Project overview
- `GETTING_STARTED.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - What's been built
- `QUICK_START.md` - This file

## 🎯 Next Steps

1. **Right now**: Set up environment variables and run migrations
2. **Today**: Get the app running and test authentication
3. **This week**: Implement the 6 remaining pages
4. **Optional**: Add more features, deploy to production

---

**Need help?** Check GETTING_STARTED.md for detailed instructions and troubleshooting.

**Ready to code?** Look at Login.tsx and Home.tsx for examples of how to build the other pages.

Your backend is production-ready! Just add the UI and you're done. 🚀
