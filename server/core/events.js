// events core module: routes emit "lowStock", this listener reacts to it.
const EventEmitter = require('events');
const { log } = require('./logger');

const inventoryEvents = new EventEmitter();

inventoryEvents.on('lowStock', (product) => {
  const message = `LOW STOCK: ${product.sku} has ${product.stock} left (reorder level ${product.reorderLevel})`;
  console.log(message);
  log(message);
});

module.exports = inventoryEvents;
