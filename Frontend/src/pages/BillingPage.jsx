import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BillingPage.css';

const BillingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/billing/products/');
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError('Could not load products from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="billing-page">
      <div className="billing-header">
        <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
        <h1>Billing</h1>
      </div>

      <p className="billing-intro">
        Products are loaded from the backend billing module. Select an item to review pricing.
      </p>

      {loading && <div className="billing-status">Loading products...</div>}
      {error && <div className="billing-error">{error}</div>}

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="product-meta">
              <span>Price:</span>
              <strong>${product.price}</strong>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && products.length === 0 && (
        <div className="billing-status">No products available yet.</div>
      )}
    </div>
  );
};

export default BillingPage;
