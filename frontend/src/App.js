import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        setIsLoggedIn(true);
        setError('');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analytics/attention', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAnalytics();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>Consumer Attention Mapping System</h1>
        <div className="login-box">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>🛍️ Consumer Attention Dashboard</h1>

      {analyticsData && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <h3>Total Shoppers Today</h3>
              <p>{analyticsData.total_shoppers_today}</p>
            </div>
            <div className="stat-card">
              <h3>Average Dwell Time</h3>
              <p>{analyticsData.average_dwell_time}s</p>
            </div>
            <div className="stat-card">
              <h3>Most Viewed Shelf</h3>
              <p>{analyticsData.most_viewed_shelf}</p>
            </div>
          </div>

          <div className="chart-container">
            <h2>Shelf Attention Analytics</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.shelves}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shelf" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dwell_time" fill="#8884d8" name="Dwell Time (seconds)" />
                <Bar dataKey="shoppers" fill="#82ca9d" name="Number of Shoppers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default App;