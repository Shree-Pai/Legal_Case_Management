import React, { useState, useEffect } from "react";
import { getDashboardData } from "../api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null); // Set initial state to null
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  useEffect(() => {
    getDashboardData()
      .then((response) => {
        setDashboardData(response);
        setLoading(false); // Data fetched successfully
      })
      .catch((error) => {
        setError("Error fetching dashboard data.");
        setLoading(false); // Data fetch failed
      });
  }, []);

  const containerStyle = {
    padding: "30px",
    maxWidth: "1000px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#2c3e50", // Dark background for the container
    color: "#ecf0f1", // Light text color
    borderRadius: "10px",
  };

  const cardStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", // Adjusted for responsiveness
    gap: "20px",
    marginTop: "30px",
  };

  const card = {
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "#34495e", // Darker card background
    color: "white",
    textAlign: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", // Slightly stronger shadow
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  };

  const cardTitle = {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#3498db", // A bright color for the title text
  };

  const cardValue = {
    fontSize: "30px",
    fontWeight: "bold",
  };

  const cardHover = {
    "&:hover": {
      transform: "scale(1.05)", // Scale up on hover for interactivity
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.5)", // Stronger shadow on hover
    },
  };

  // Loading and Error Handling UI
  if (loading) {
    return (
      <div style={containerStyle}>
        <h2 style={{ textAlign: "center" }}>Dashboard</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <h2 style={{ textAlign: "center" }}>Dashboard</h2>
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Dashboard</h2>
      <div style={cardStyle}>
        <div style={card}>
          <div style={cardTitle}>Total Clients</div>
          <div style={cardValue}>{dashboardData?.total_clients || 0}</div> {/* Safely accessing data */}
        </div>
        <div style={card}>
          <div style={cardTitle}>Total Cases</div>
          <div style={cardValue}>{dashboardData?.total_cases || 0}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Important Cases</div>
          <div style={cardValue}>{dashboardData?.important_cases || 0}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Archived Cases</div>
          <div style={cardValue}>{dashboardData?.archived_cases || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
