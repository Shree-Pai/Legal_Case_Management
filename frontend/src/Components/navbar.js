import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Manage login state
  const location = useLocation(); // Get current location to check for the home page, login, or register page

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "linear-gradient(45deg, #3498db, #2980b9)", // Gradient background for a sleek look
    color: "white",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    margin: "0 15px",
    fontSize: "16px",
    fontWeight: "500",
    transition: "color 0.3s ease", // Smooth transition for hover effect
  };

  const linkHoverStyle = {
    color: "#ecf0f1", // Light color on hover
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Set the login state to false on logout
  };

  const handleLogin = () => {
    setIsLoggedIn(true); // Set the login state to true on login
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
      </div>
      <div>
        {isLoggedIn && location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/" ? (
          // Display profile and logout when logged in, but not on the login, register, or home page
          <>
            <Link
              to="/dashboard"
              style={linkStyle}
              onMouseEnter={(e) => (e.target.style.color = linkHoverStyle.color)}
              onMouseLeave={(e) => (e.target.style.color = linkStyle.color)}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              style={linkStyle}
              onMouseEnter={(e) => (e.target.style.color = linkHoverStyle.color)}
              onMouseLeave={(e) => (e.target.style.color = linkStyle.color)}
            >
              Profile
            </Link>
            <Link
              to="/"
              style={linkStyle}
              onClick={handleLogout} // Trigger logout function when clicking logout link
              onMouseEnter={(e) => (e.target.style.color = linkHoverStyle.color)}
              onMouseLeave={(e) => (e.target.style.color = linkStyle.color)}
            >
              Logout
            </Link>
          </>
        ) : (
          // Display login and register links when not logged in, and hide them on the login/register pages
          location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/" && (
            <>
              <Link
                to="/login"
                style={linkStyle}
                onMouseEnter={(e) => (e.target.style.color = linkHoverStyle.color)}
                onMouseLeave={(e) => (e.target.style.color = linkStyle.color)}
                onClick={handleLogin} // Trigger login function when clicking login link
              >
                Login
              </Link>
              <Link
                to="/register"
                style={linkStyle}
                onMouseEnter={(e) => (e.target.style.color = linkHoverStyle.color)}
                onMouseLeave={(e) => (e.target.style.color = linkStyle.color)}
              >
                Register
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
