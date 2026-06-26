import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BillingPage from './pages/BillingPage';
import './styles/LoginPage.css';
import './styles/Dashboard.css';
import './styles/BillingPage.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/billing" element={<BillingPage />} />
      </Routes>
    </Router>
  );
}

export default App;