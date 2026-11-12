const express = require('express');
const Sale = require('../models/Sale');

const router = express.Router();

// Optional filter: GET /api/sales?productId=...
router.get('/', async (req, res) => {
  const filter = req.query.productId ? { productId: req.query.productId } : {};
  res.json(await Sale.find(filter).sort('date'));
});

router.get('/:id', async (req, res) => {
  res.json(await Sale.findById(req.params.id).orFail());
});

router.post('/', async (req, res) => {
  res.status(201).json(await Sale.create(req.body));
});

router.put('/:id', async (req, res) => {
  const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  }).orFail();
  res.json(sale);
});

router.delete('/:id', async (req, res) => {
  await Sale.findByIdAndDelete(req.params.id).orFail();
  res.status(204).end();
});

module.exports = router;
