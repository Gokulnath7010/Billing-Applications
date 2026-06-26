import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome! You have successfully logged in.</p>

      <div className="dashboard-actions">
        <button className="billing-button" onClick={() => navigate('/billing')}>
          Go to Billing
        </button>
      </div>

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
