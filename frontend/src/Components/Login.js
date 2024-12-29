import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios for HTTP requests

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // For redirecting after successful login

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

    // Form validation: Check if username and password are filled
    if (!username || !password) {
      setError("Both fields are required");
    } else {
      setError("");

      try {
        // Sending a POST request to the backend for login authentication
        const response = await axios.post("http://127.0.0.1:5000/admin/login", {
          name: username,    // Ensure this matches the name field in the backend
          password: password
        });

        // Assuming backend sends a response with a success message and user data
        console.log("Login successful:", response.data);

        // Redirect to the dashboard (or another page) after successful login
        navigate("/dashboard");  // Adjust the redirect path as needed

      } catch (err) {
        console.error("Login failed:", err);
        setError("Invalid username or password");  // Set error message if login fails
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
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
        >
          Login
        </button>
      </form>
      <Link to="/register" style={linkStyle}>
        Not registered yet? Register here
      </Link>
    </div>
  );
};

export default Login;
