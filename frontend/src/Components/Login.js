import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api"; // Import login function from api.js

const Login = ({ handleLogin }) => { // Receive handleLogin as prop
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#2c3e50", // Dark background for the container
    fontFamily: "Arial, sans-serif",
    color: "#ecf0f1", // Light text color
    padding: "20px",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "350px", // Max width for the form
    backgroundColor: "#34495e", // Form background color
    padding: "30px",
    borderRadius: "8px", // Rounded corners
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)", // Shadow effect
  };

  const inputStyle = {
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #34495e", // Subtle border color
    borderRadius: "5px",
    backgroundColor: "#2c3e50", // Dark background for inputs
    color: "#ecf0f1", // Light text color for inputs
    width: "100%",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "12px 20px",
    backgroundColor: "#3498db", // Blue button
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    width: "100%", // Full width for the button
    transition: "background-color 0.3s ease",
  };

  const buttonHoverStyle = {
    backgroundColor: "#2980b9", // Darker blue on hover
  };

  const linkStyle = {
    marginTop: "10px",
    color: "#3498db", // Bright color for link
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.3s ease",
    textAlign: "center", // Centering the link
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
  };

  const handleButtonMouseOut = (e) => {
    e.target.style.backgroundColor = buttonStyle.backgroundColor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = {
        email: username,
        password: password
      };

      const response = await login(formData);
      
      // Store token and user data
      localStorage.setItem('userToken', response.token);
      localStorage.setItem('adminId', response.admin_id.toString());
      localStorage.setItem('adminName', response.name);
      localStorage.setItem('adminEmail', response.email);
      
      handleLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Email" // Changed from Username to Email
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: "#e74c3c", textAlign: "center" }}>{error}</p>}
        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonMouseOut}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <Link to="/register" style={linkStyle}>
        Not registered yet? Register here
      </Link>
    </div>
  );
};

export default Login;
