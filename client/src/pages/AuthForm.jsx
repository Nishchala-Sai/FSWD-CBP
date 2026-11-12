import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api';

// One component serves both pages; the `mode` prop decides which
export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { token } = await api(`/auth/${mode}`, { method: 'POST', body: form });
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <p className="error">{error}</p>}
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>
      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </label>
      <button className="button">{isLogin ? 'Login' : 'Create account'}</button>
      {isLogin ? (
        <p>No account? <Link to="/register">Register</Link></p>
      ) : (
        <p>Already registered? <Link to="/login">Login</Link></p>
      )}
    </form>
  );
}
