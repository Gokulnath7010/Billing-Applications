import React from 'react';
import '../styles/Dashboard.css';
const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome! You have successfully logged in!!!.</p>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Overview</h2>

          <p>View your billing summary and recent activity.</p>
        </div>
        <div className="dashboard-card1">
          <h2>Reports</h2>

          <p>Check your Payment history and generate reports.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
