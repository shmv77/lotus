-- Seed categories
INSERT INTO categories (name, description, slug, image_url) VALUES
  ('Cocktails', 'Premium mixed cocktails', 'cocktails', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b'),
  ('Spirits', 'Fine spirits and liquors', 'spirits', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b'),
  ('Mixers', 'Quality mixers and sodas', 'mixers', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8'),
  ('Accessories', 'Bar tools and accessories', 'accessories', 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137');

-- Seed cocktails
INSERT INTO cocktails (name, description, price, image_url, category_id, ingredients, alcohol_content, volume_ml, stock, is_featured) VALUES
  (
    'Mojito',
    'A refreshing Cuban cocktail with white rum, lime, mint, sugar, and soda water',
    12.99,
    'https://images.unsplash.com/photo-1551538827-9c037cb4f32a',
    (SELECT id FROM categories WHERE slug = 'cocktails' LIMIT 1),
    '["White Rum", "Lime Juice", "Fresh Mint", "Sugar", "Soda Water"]'::jsonb,
    10.0,
    300,
    50,
    TRUE
  ),
  (
    'Old Fashioned',
    'Classic whiskey cocktail with bourbon, bitters, sugar, and orange peel',
    14.99,
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8',
    (SELECT id FROM categories WHERE slug = 'cocktails' LIMIT 1),
    '["Bourbon", "Angostura Bitters", "Sugar", "Orange Peel"]'::jsonb,
    35.0,
    200,
    45,
    TRUE
  ),
  (
    'Margarita',
    'Iconic tequila cocktail with lime juice, triple sec, and salt rim',
    13.99,
    'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9',
    (SELECT id FROM categories WHERE slug = 'cocktails' LIMIT 1),
    '["Tequila", "Triple Sec", "Lime Juice", "Salt"]'::jsonb,
    15.0,
    250,
    60,
    TRUE
  ),
  (
    'Cosmopolitan',
    'Elegant vodka cocktail with cranberry, lime, and triple sec',
    13.49,
    'https://images.unsplash.com/photo-1536935338788-846bb9981813',
    (SELECT id FROM categories WHERE slug = 'cocktails' LIMIT 1),
    '["Vodka", "Triple Sec", "Cranberry Juice", "Lime Juice"]'::jsonb,
    12.0,
    200,
    40,
    FALSE
  ),
  (
    'Negroni',
    'Bold Italian aperitif with gin, Campari, and sweet vermouth',
    15.99,
    'https://images.unsplash.com/photo-1546171753-97d7676e4602',
    (SELECT id FROM categories WHERE slug = 'cocktails' LIMIT 1),
    '["Gin", "Campari", "Sweet Vermouth"]'::jsonb,
    24.0,
    180,
    35,
    FALSE
  ),
  (
    'Espresso Martini',
    'Contemporary cocktail with vodka, coffee liqueur, and fresh espresso',
    14.49,
    'https://images.unsplash.com/photo-1558977076-bd8fb3c6d3ac',
    (SELECT id FROM categories WHERE slug = 'cocktails' LIMIT 1),
    '["Vodka", "Coffee Liqueur", "Espresso", "Sugar Syrup"]'::jsonb,
    18.0,
    200,
    55,
    TRUE
  ),
  (
    'Premium Vodka',
    'Ultra-smooth premium vodka, triple distilled',
    39.99,
    'https://images.unsplash.com/photo-1566289098736-bd5e2f3ccaf4',
    (SELECT id FROM categories WHERE slug = 'spirits' LIMIT 1),
    '["Vodka"]'::jsonb,
    40.0,
    750,
    30,
    FALSE
  ),
  (
    'Single Malt Whisky',
    'Aged 12 years, smooth and complex',
    59.99,
    'https://images.unsplash.com/photo-1527281400608-55e2d7e5197f',
    (SELECT id FROM categories WHERE slug = 'spirits' LIMIT 1),
    '["Whisky"]'::jsonb,
    43.0,
    700,
    20,
    FALSE
  ),
  (
    'Premium Gin',
    'Botanical gin with juniper, coriander, and citrus notes',
    44.99,
    'https://images.unsplash.com/photo-1583323640384-f9d36db82f05',
    (SELECT id FROM categories WHERE slug = 'spirits' LIMIT 1),
    '["Gin"]'::jsonb,
    40.0,
    750,
    25,
    FALSE
  ),
  (
    'Tonic Water Premium',
    'Artisanal tonic water with natural quinine',
    3.99,
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f',
    (SELECT id FROM categories WHERE slug = 'mixers' LIMIT 1),
    '["Carbonated Water", "Quinine", "Natural Flavors"]'::jsonb,
    0.0,
    200,
    100,
    FALSE
  ),
  (
    'Ginger Beer',
    'Spicy and refreshing ginger beer',
    4.49,
    'https://images.unsplash.com/photo-1607532941433-304659e8198a',
    (SELECT id FROM categories WHERE slug = 'mixers' LIMIT 1),
    '["Ginger", "Carbonated Water", "Sugar", "Citric Acid"]'::jsonb,
    0.0,
    200,
    80,
    FALSE
  ),
  (
    'Cocktail Shaker Set',
    'Professional stainless steel shaker set with strainer',
    29.99,
    'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137',
    (SELECT id FROM categories WHERE slug = 'accessories' LIMIT 1),
    '[]'::jsonb,
    0.0,
    NULL,
    40,
    FALSE
  );

-- Note: In a real scenario, you would create an admin user through Supabase Auth
-- and then manually update their profile role to 'admin' in the profiles table
