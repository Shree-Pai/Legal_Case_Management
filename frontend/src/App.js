import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Navbar from "./Components/navbar";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import Cases from "./Components/Cases";
import Clients from "./Components/Clients";
import Appointments from "./Components/Appointments";
import Profile from "./Components/profile"; // Profile Page Component
import EditProfile from "./Components/EditProfile";
import Schedule from "./Components/schedule";

function App() {
  // Global state for login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle login
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Global Styling
  const containerStyle = {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "#ecf0f1", // Light background for the main container
  };

  const buttonStyle = {
    padding: "12px 25px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
  };

  const buttonHoverStyle = {
    backgroundColor: "#0056b3", // Darker blue on hover
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = buttonStyle.backgroundColor;
  };

  return (
    <Router>
      <div>
        <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Routes>
          {/* Homepage Route */}
          <Route
            path="/"
            element={
              <div style={containerStyle}>
                <h1 style={{ color: "#2c3e50" }}>
                  Welcome to Legal Case Management System
                </h1>
                <p style={{ fontSize: "18px", color: "#7f8c8d" }}>
                  Manage your cases, appointments, and clients efficiently.
                </p>
                <button
                  style={buttonStyle}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <Link
                    to="/login"
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    Go to Login
                  </Link>
                </button>
              </div>
            }
          />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Page */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Dashboard and Admin Routes */}
          <Route
            path="/dashboard/*"
            element={
              <div style={{ display: "flex", backgroundColor: "#f4f6f7", minHeight: "100vh" }}>
                <Sidebar />
                <div style={{ flex: 1, padding: "20px" }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cases" element={<Cases />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/schedule" element={<Schedule />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
