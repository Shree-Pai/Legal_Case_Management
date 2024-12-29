import React, { useState, useEffect } from "react";
import { getDashboardData } from "../api";
import "./styles.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_lawyers: 0,
    total_clients: 0,
    total_cases: 0,
    total_appointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Lawyers',
      value: dashboardData.total_lawyers,
      color: '#3498db'
    },
    {
      title: 'Total Clients',
      value: dashboardData.total_clients,
      color: '#2ecc71'
    },
    {
      title: 'Total Cases',
      value: dashboardData.total_cases,
      color: '#e74c3c'
    },
    {
      title: 'Total Appointments',
      value: dashboardData.total_appointments,
      color: '#f39c12'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="dashboard-card"
            style={{ borderColor: card.color }}
          >
            <h2>{card.title}</h2>
            <p className="dashboard-value" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
