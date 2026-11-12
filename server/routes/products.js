const express = require('express');
const { URL } = require('url');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const inventoryEvents = require('../core/events');
const cache = require('../cache');
const { forecast } = require('../forecast');

const router = express.Router();

// Emit "lowStock" whenever a saved product is at or below its reorder level
const checkStock = (product) => {
  if (product.stock <= product.reorderLevel) inventoryEvents.emit('lowStock', product);
  return product;
};

router.get('/', async (req, res) => {
  res.json(await Product.find().sort('sku'));
});

router.get('/:id', async (req, res) => {
  res.json(await Product.findById(req.params.id).orFail());
});

router.post('/', async (req, res) => {
  res.status(201).json(checkStock(await Product.create(req.body)));
});

router.put('/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  }).orFail();
  res.json(checkStock(product));
});

router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id).orFail();
  await Sale.deleteMany({ productId: req.params.id });
  res.status(204).end();
});

// GET /api/products/:id/forecast?method=sma|ses&window=3&alpha=0.5
router.get('/:id/forecast', async (req, res) => {
  // url core module: parse the query string from the raw request URL
  const params = new URL(req.originalUrl, `http://${req.headers.host}`).searchParams;
  const method = params.get('method') ?? 'sma';
  const window = Number(params.get('window') ?? 3);
  const alpha = Number(params.get('alpha') ?? 0.5);

  if (!['sma', 'ses'].includes(method) || !Number.isInteger(window) || window < 1 || !(alpha > 0 && alpha <= 1)) {
    return res.status(400).json({ error: 'Use method=sma|ses, window >= 1, 0 < alpha <= 1' });
  }

  const settings = method === 'sma' ? { method, window } : { method, alpha };
  const cacheKey = `forecast:${req.params.id}:${Object.values(settings).join(':')}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  const product = await Product.findById(req.params.id).orFail();
  const sales = await Sale.find({ productId: product._id }).sort('date');
  const result = {
    product: { name: product.name, sku: product.sku },
    ...settings,
    history: sales.map((s) => ({ date: s.date.toISOString().slice(0, 10), quantity: s.quantity })),
    forecast: forecast(sales.map((s) => s.quantity), settings),
  };

  await cache.set(cacheKey, result);
  res.json(result);
});

module.exports = router;
