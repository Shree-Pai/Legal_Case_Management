import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();

  const navStyle = {
    backgroundColor: "#2c3e50",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    position: "fixed", // Ensure the navbar stays fixed at the top
    top: 0,            // Start at the top of the page
    left: 0,           // Align to the left side of the page
    right: 0,          // Align to the right side of the page
    zIndex: 1000,      // Ensure it is above other content
  };

  const brandStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#3498db",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    textDecoration: "none",
    marginLeft: "10px",
  };

  const handleLogoutClick = () => {
    localStorage.clear(); // Clear all stored data
    handleLogout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>
        <Link to="/" style={linkStyle}>
          Legal Case Management
        </Link>
      </div>
      <div>
        {isLoggedIn && (
          <Link to="/profile" style={buttonStyle}>
            Profile
          </Link>
        )}
        {isLoggedIn ? (
          <button onClick={handleLogoutClick} style={buttonStyle}>
            Logout
          </button>
        ) : (
          <Link to="/login" style={buttonStyle}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
