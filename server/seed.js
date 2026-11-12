// Resets the database with sample data. Run with: npm run seed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

const products = [
  { name: 'Mechanical Keyboard', sku: 'P101', stock: 14, reorderLevel: 20 },
  { name: 'Wireless Gaming Mouse', sku: 'P102', stock: 42, reorderLevel: 15 },
  { name: 'UltraWide Monitor 34"', sku: 'P103', stock: 5, reorderLevel: 10 },
  { name: 'USB-C Docking Station', sku: 'P104', stock: 30, reorderLevel: 12 },
];

// Ten days of daily sales; each product scales this base pattern differently
const baseSales = [12, 18, 15, 22, 20, 28, 24, 31, 29, 35];
const scale = [1, 1.5, 0.3, 0.7];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Product.deleteMany(), Sale.deleteMany()]);

  await User.create({ email: 'demo@example.com', password: await bcrypt.hash('password123', 10) });
  const created = await Product.insertMany(products);

  const sales = created.flatMap((product, p) =>
    baseSales.map((qty, day) => ({
      productId: product._id,
      date: new Date(Date.UTC(2026, 9, 15 + day)),
      quantity: Math.round(qty * scale[p]),
    })),
  );
  await Sale.insertMany(sales);

  console.log(`Seeded ${created.length} products, ${sales.length} sales, user demo@example.com / password123`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
