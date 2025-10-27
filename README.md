# Lotus - Cocktail E-Commerce Store

A modern, full-stack e-commerce platform for cocktails and bar products built with React, Express, TypeScript, and Supabase.

## Features

- 🎨 Beautiful dark/modern theme with smooth animations
- 🔐 User authentication with Supabase Auth
- 🛒 Shopping cart with persistent storage
- 💳 Stripe payment integration
- 👑 Admin dashboard for product & order management
- 📱 Responsive design
- ⚡ Fast performance with Vite

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Supabase Client

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase
- Stripe

### Database
- Supabase (PostgreSQL)

## Project Structure

```
lotus/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types
└── supabase/        # Database migrations
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd lotus
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up environment variables
   - Copy `.env.example` to `.env` in both `client/` and `server/` directories
   - Fill in your Supabase and Stripe credentials

4. Set up Supabase
   - Run migrations in your Supabase project
   - Seed the database (optional)

5. Start development servers
```bash
npm run dev
```

This will start:
- Client: http://localhost:5173
- Server: http://localhost:3000

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build both client and server
- `npm run build:client` - Build only the client
- `npm run build:server` - Build only the server

## Environment Variables

### Client (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_API_URL=http://localhost:3000
```

### Server (.env)
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NODE_ENV=development
```

## License

MIT
