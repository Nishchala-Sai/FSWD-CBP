import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../api';

const fields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'sku', label: 'SKU', type: 'text' },
  { name: 'stock', label: 'Stock', type: 'number' },
  { name: 'reorderLevel', label: 'Reorder Level', type: 'number' },
];

// Add (/products/new) and Edit (/products/:id/edit) share this form
export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', sku: '', stock: '', reorderLevel: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api(`/products/${id}`)
      .then(({ name, sku, stock, reorderLevel }) => setForm({ name, sku, stock, reorderLevel }))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api(id ? `/products/${id}` : '/products', { method: id ? 'PUT' : 'POST', body: form });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{id ? 'Edit Product' : 'Add Product'}</h2>
      {error && <p className="error">{error}</p>}
      {fields.map(({ name, label, type }) => (
        <label key={name}>
          {label}
          <input name={name} type={type} min={type === 'number' ? 0 : undefined} value={form[name]} onChange={handleChange} required />
        </label>
      ))}
      <button className="button">Save</button>
    </form>
  );
}
