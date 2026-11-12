// An array of objects holds the product data (const: the reference never changes)
const products = [
  { sku: 'P101', name: 'Mechanical Keyboard', category: 'Peripherals', stock: 14, reorderLevel: 20 },
  { sku: 'P102', name: 'Wireless Gaming Mouse', category: 'Peripherals', stock: 42, reorderLevel: 15 },
  { sku: 'P103', name: 'UltraWide Monitor 34"', category: 'Displays', stock: 5, reorderLevel: 10 },
  { sku: 'P104', name: 'USB-C Docking Station', category: 'Accessories', stock: 30, reorderLevel: 12 },
];

const rows = document.getElementById('product-rows');
const filterInput = document.getElementById('filter');
const form = document.getElementById('product-form');
const summary = document.getElementById('summary');

// Arrow function + template literal builds one table row
const toRow = ({ sku, name, category, stock, reorderLevel }) => {
  const low = stock <= reorderLevel;
  return `<tr>
    <td>${sku}</td><td>${name}</td><td>${category}</td><td>${stock}</td><td>${reorderLevel}</td>
    <td><span class="badge ${low ? 'reorder' : 'ok'}">${low ? 'Reorder needed' : 'OK'}</span></td>
  </tr>`;
};

function render() {
  // String methods: trim + toLowerCase + includes for a case-insensitive filter
  const term = filterInput.value.trim().toLowerCase();
  const visible = products.filter((p) => p.name.toLowerCase().includes(term));
  rows.innerHTML = visible.map(toRow).join('');

  // let: a counter that changes inside the loop
  let lowCount = 0;
  for (const p of visible) {
    if (p.stock <= p.reorderLevel) lowCount++;
  }
  summary.textContent = `${lowCount} of ${visible.length} products need reordering`;
}

filterInput.addEventListener('input', render);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  products.push({
    ...data,
    sku: data.sku.trim().toUpperCase(),
    stock: Number(data.stock),
    reorderLevel: Number(data.reorderLevel),
  });
  form.reset();
  render();
  window.location.hash = 'products'; // window object: scroll back to the table
});

window.addEventListener('DOMContentLoaded', render);
