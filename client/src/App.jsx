import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';
import ErrorBoundary from './components/ErrorBoundary';
import AuthForm from './pages/AuthForm';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Forecast from './pages/Forecast';

// Layout route: only renders its child pages when a token is stored
function RequireAuth() {
  return localStorage.getItem('token') ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Inventory &amp; Demand Forecasting</h1>
        <nav className="nav">
          <Link to="/">Products</Link>
          <Link to="/products/new">Add Product</Link>
          <button className="link-button" onClick={logout}>Logout</button>
        </nav>
      </header>

      <ErrorBoundary>
        {/* key gives each page its own fresh state when switching between routes that share a component */}
        <Routes>
          <Route path="/login" element={<AuthForm key="login" mode="login" />} />
          <Route path="/register" element={<AuthForm key="register" mode="register" />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Products />} />
            <Route path="/products/new" element={<ProductForm key="new" />} />
            <Route path="/products/:id/edit" element={<ProductForm key="edit" />} />
            <Route path="/products/:id/forecast" element={<Forecast />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
