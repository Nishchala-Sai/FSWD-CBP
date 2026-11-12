const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  stock: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('Product', productSchema);
