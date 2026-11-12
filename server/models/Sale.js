const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  date: { type: Date, required: true },
  quantity: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('Sale', saleSchema);
