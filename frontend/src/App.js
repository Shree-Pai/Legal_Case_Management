import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Navbar from "./Components/navbar";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import Cases from "./Components/Cases";
import Clients from "./Components/Clients";
import Appointments from "./Components/Appointments";
import Profile from "./Components/Profile";
import Lawyer from "./Components/Lawyer";
import Schedule from "./Components/schedule";
import ViewDetails from './Components/ViewDetails';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

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

  // Global Styling for homepage with background image
  const containerStyle = {
    display: "flex",
    flexDirection: "column", // Stack content vertically
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    textAlign: "center",
    padding: "50px",
    backgroundImage: "url('https://edusarthi.org/images/courses/law.jpg')", // Set your background image URL here
    backgroundSize: "cover",   // Make sure the background image covers the entire container
    backgroundPosition: "center", // Center the background image
    backgroundRepeat: "no-repeat", // Prevent the background from repeating
    height: "100vh",  // Ensure the container takes up the entire viewport height
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

  // Card styling
  const cardContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  };

  const cardStyle = {
    backgroundColor: "transparent",  // Make the background transparent
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Keep some shadow for better visibility
    padding: "20px",
    textAlign: "center",
    width: "250px",
    transition: "transform 0.3s ease",
    color: "white",  // Text color to white for visibility on a transparent background
  };

  const cardHoverStyle = {
    transform: "scale(1.05)",
  };

  const handleCardHover = (e) => {
    e.target.style.transform = cardHoverStyle.transform;
  };

  const handleCardLeave = (e) => {
    e.target.style.transform = "scale(1)";
  };

  return (
    <Router>
      <div>
        <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Routes>
          {/* Homepage Route with Background Image */}
          <Route
            path="/"
            element={
              <div style={containerStyle}>
                <h1 style={{ color: "#fff" }}>
                  Welcome to Legal LawOffice
                </h1>
                <p style={{ fontSize: "18px", color: "#ecf0f1" }}>
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
                    Explore
                  </Link>
                </button>

                {/* Cards Section */}
                <div style={cardContainerStyle}>
                  <div
                    style={cardStyle}
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                  >
                    <h3>Cases</h3>
                    <p>Manage and track your legal cases efficiently.</p>
                  </div>

                  {/* <div
                    style={cardStyle}
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                  >
                    <h3>Appointments</h3>
                    <p>Schedule and manage appointments with clients and lawyers.</p>
                  </div> */}

                  {/* New Articles Card Below Appointments */}
                  <div
                    style={cardStyle}
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                  >
                    <h3>Articles</h3>
                    <p>Read the latest legal articles and news.</p>
                    <a
                      href="https://www.simplelegal.com/blog/top-in-house-legal-blogs-to-follow" // Replace with the actual articles URL
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007BFF", textDecoration: "none" }}
                    >
                      Visit Articles
                    </a>
                  </div>

                  <div
                    style={cardStyle}
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                  >
                    <h3>Clients</h3>
                    <p>Manage client information and requests efficiently.</p>
                  </div>
                </div>
              </div>
            }
          />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <div style={{ display: "flex", backgroundColor: "#f4f6f7", minHeight: "100vh" }}>
                  <Sidebar />
                  <div style={{ flex: 1, padding: "20px" }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/cases" element={<Cases />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/lawyer" element={<Lawyer />} />
                      <Route path="/view-details" element={<ViewDetails />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
