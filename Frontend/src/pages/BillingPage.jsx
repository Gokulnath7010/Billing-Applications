import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import '../styles/BillingPage.css';

const BillingPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
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

  const addProduct = (product) => {
    setMessage('');
    setCart((prevCart) => {
      const existing = prevCart[product.id] || {
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 0,
      };

      return {
        ...prevCart,
        [product.id]: {
          ...existing,
          quantity: existing.quantity + 1,
        },
      };
    });
  };

  const invoiceItems = Object.values(cart).filter((item) => item.quantity > 0);
  const total = invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const downloadInvoicePdf = (invoice) => {
    const doc = new jsPDF();
    const lineHeight = 10;
    doc.setFontSize(18);
    doc.text('Invoice', 14, 22);
    doc.setFontSize(11);
    doc.text(`Invoice #${invoice.id}`, 14, 34);
    doc.text(`Date: ${invoice.created_at.split('T')[0]}`, 14, 40);
    doc.text(`Total: $${invoice.total}`, 14, 46);
    doc.text('Items:', 14, 58);

    const headers = ['Item', 'Qty', 'Unit Price', 'Line Total'];
    const startY = 68;
    headers.forEach((text, index) => {
      doc.text(text, 14 + index * 40, startY);
    });

    invoice.items.forEach((item, index) => {
      const y = startY + lineHeight + index * lineHeight;
      doc.text(item.product_name, 14, y);
      doc.text(String(item.quantity), 54, y);
      doc.text(`$${item.unit_price}`, 94, y);
      doc.text(`$${item.line_total}`, 134, y);
    });

    doc.save(`invoice-${invoice.id}.pdf`);
  };

  const handlePurchase = async () => {
    if (invoiceItems.length === 0) {
      setMessage('Please add a product before purchasing.');
      return;
    }

    setPurchaseLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await fetch('/api/billing/invoice/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: invoiceItems.map(({ product_id, quantity }) => ({ product_id, quantity })),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Purchase failed.');
        return;
      }

      downloadInvoicePdf(data.invoice);
      setCart({});
      setMessage(`Purchase completed. Invoice #${data.invoice.id} has been created.`);
      navigate('/dashboard', { state: { invoice: data.invoice } });
    } catch (err) {
      setError('Network error while creating invoice.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-header">
        <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
        <h1>Billing</h1>
      </div>

      <p className="billing-intro">
        Products are loaded from the backend billing module. Add items to the cart, review the total, and purchase.
      </p>

      {loading && <div className="billing-status">Loading products...</div>}
      {error && <div className="billing-error">{error}</div>}
      {message && <div className="billing-success">{message}</div>}

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="product-meta">
              <span>Price:</span>
              <strong>${product.price}</strong>
            </div>
            <button type="button" className="product-add-btn" onClick={() => addProduct(product)}>
              Add
            </button>
          </div>
        ))}
      </div>

      {!loading && !error && products.length === 0 && (
        <div className="billing-status">No products available yet.</div>
      )}

      {invoiceItems.length > 0 && (
        <div className="invoice-summary">
          <h2>Order Summary</h2>
          <div className="invoice-items">
            {invoiceItems.map((item) => (
              <div key={item.product_id} className="invoice-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div>
                  <span>${item.price.toFixed(2)}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="invoice-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button type="button" className="purchase-btn" onClick={handlePurchase} disabled={purchaseLoading}>
            {purchaseLoading ? 'Processing...' : 'Purchase'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
