import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (location.state?.invoice) {
      setInvoice(location.state.invoice);
      localStorage.setItem('latestInvoice', JSON.stringify(location.state.invoice));
      return;
    }

    const savedInvoice = localStorage.getItem('latestInvoice');
    if (savedInvoice) {
      setInvoice(JSON.parse(savedInvoice));
    }
  }, [location.state]);

  const downloadInvoicePdf = () => {
    if (!invoice) return;

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

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome! You have successfully logged in.</p>

      <div className="dashboard-actions">
        <button className="billing-button" onClick={() => navigate('/billing')}>
          Go to Billing
        </button>
      </div>

      {invoice && (
        <div className="dashboard-invoice-card">
          <h2>Latest Invoice</h2>
          <p>Invoice #{invoice.id} created on {invoice.created_at.split('T')[0]}</p>
          <div className="dashboard-invoice-list">
            {invoice.items.map((item) => (
              <div key={`${invoice.id}-${item.product_id}`} className="dashboard-invoice-item">
                <span>{item.product_name}</span>
                <span>{item.quantity} × ${item.unit_price}</span>
                <strong>${item.line_total}</strong>
              </div>
            ))}
          </div>
          <div className="dashboard-invoice-total">
            <span>Total</span>
            <strong>${invoice.total}</strong>
          </div>
          <button className="dashboard-download-btn" onClick={downloadInvoicePdf}>
            Download Invoice PDF
          </button>
        </div>
      )}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Overview</h2>
          <p>View your billing summary and recent activity.</p>
        </div>
        <div className="dashboard-card1">
          <h2>Reports</h2>
          <p>Check your payment history and generate reports.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
