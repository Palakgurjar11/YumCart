/**
 * Seeds an admin account + sample YumCart catalogue.
 * Run: npm run seed (from ./server after MongoDB is up)
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import '../src/models/User.js';
import '../src/models/Food.js';

import User from '../src/models/User.js';
import Food from '../src/models/Food.js';
import Order from '../src/models/Order.js';
import Cart from '../src/models/Cart.js';

const sampleFoods = [
  {
    name: 'Masala Dosa',
    description: 'Crisp rice crepe with spiced potato mash — Chennai style.',
    price: 149,
    category: 'Breakfast',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1668236543090-82eba5eeff5e?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Hyderabadi Biryani',
    description: 'Slow-cooked basmati with tender chicken, saffron, and fried onions.',
    price: 349,
    category: 'Indian',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1563379091339-03b31ca45713?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Margherita Pizza',
    description: 'Stone-baked crust, San Marzano tomato, buffalo mozzarella.',
    price: 299,
    category: 'Pizza',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Paneer Tikka Burger',
    description: 'Smoky tikka-marinated paneer, mint aioli, brioche bun.',
    price: 199,
    category: 'Burgers',
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Truffle Pasta',
    description: 'Fresh tagliatelle, parmesan cream, black truffle oil.',
    price: 379,
    category: 'Continental',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Sushi Combo',
    description: 'Chef’s assorted nigiri & maki with wasabi pickled ginger.',
    price: 499,
    category: 'Japanese',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1579584425555-cfcec6d843d4?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm-center Belgian chocolate cake, vanilla bean gelato.',
    price: 179,
    category: 'Desserts',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Mango Lassi Shake',
    description: 'Alphonso mango, yogurt, hint of cardamom — thick & icy.',
    price: 129,
    category: 'Beverages',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1572490122747-3968b75cc969?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Korean Bibimbap Bowl',
    description: 'Gochujang veggies, marinated beef, sesame rice, crispy egg.',
    price: 329,
    category: 'Asian',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    isAvailable: true,
  },
  {
    name: 'Avocado Caesar Salad',
    description: 'Baby romaine, charred lime, parmesan petals, quinoa crunch.',
    price: 269,
    category: 'Healthy',
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    isAvailable: true,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI (copy server/.env.example to .env).');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected for seed');

  await Promise.all([
    Food.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    User.deleteMany({}),
  ]);

  const adminPlain = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  /**
   * User model hashes password on save — store plaintext here only inside seed runner.
   * Change ADMIN_EMAIL / SEED_ADMIN_PASSWORD via .env before running in sensitive environments.
   */
  await User.create({
    name: 'YumCart Admin',
    email: process.env.ADMIN_EMAIL || 'admin@yumcart.com',
    password: adminPlain,
    role: 'admin',
  });

  await Food.insertMany(sampleFoods);

  await User.create({
    name: 'Demo User',
    email: 'user@yumcart.com',
    password: 'User@123',
    role: 'user',
  });

  console.log('');
  console.log('Seed complete!');
  console.log(`  Admin login: ${process.env.ADMIN_EMAIL || 'admin@yumcart.com'} / ${adminPlain}`);
  console.log('  Demo user: user@yumcart.com / User@123');
  console.log('');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
