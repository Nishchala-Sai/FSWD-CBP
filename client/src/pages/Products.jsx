import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products').then(setProducts).catch((err) => setError(err.message));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this product and its sales history?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Inventory Status</h2>
      {error && <p className="error">{error}</p>}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.stock <= p.reorderLevel;
              return (
                <tr key={p._id}>
                  <td className="sku">{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>{p.reorderLevel}</td>
                  <td>
                    <span className={`badge ${low ? 'badge-reorder' : 'badge-ok'}`}>
                      {low ? 'Reorder needed' : 'OK'}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/products/${p._id}/forecast`}>Forecast</Link>
                    <Link to={`/products/${p._id}/edit`}>Edit</Link>
                    <button className="link-button" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
