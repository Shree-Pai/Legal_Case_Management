import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#2c3e50", // Fallback color for browsers that don't load the background image
    backgroundImage: "url('https://img.freepik.com/premium-photo/law-order-court-system-scales-themis_930683-4915.jpg')", // Add your background image URL here
    backgroundSize: "cover", // Ensure the background image covers the entire page
    backgroundPosition: "center", // Position the background image at the center
    backgroundRepeat: "no-repeat", // Prevent the background image from repeating
    fontFamily: "Arial, sans-serif",
    color: "#ecf0f1", // Light text color
    padding: "20px",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "350px",
    backgroundColor: "#34495e",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
  };

  const headingStyle = {
    color: "white",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "600",
  };

  const inputStyle = {
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #34495e",
    borderRadius: "5px",
    width: "100%",
    backgroundColor: "#2c3e50",
    color: "#ecf0f1",
    fontSize: "16px",
  };

  const inputFocusStyle = {
    borderColor: "#1abc9c",
    outline: "none",
  };

  const buttonStyle = {
    padding: "12px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    width: "100%",
    transition: "background-color 0.3s ease",
  };

  const buttonHoverStyle = {
    backgroundColor: "#2980b9",
  };

  const linkStyle = {
    marginTop: "10px",
    color: "#3498db",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.3s ease",
    textAlign: "center",
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = buttonStyle.backgroundColor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setError("");
        setSuccessMessage(data.message); // Display success message
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Error connecting to the server. Please try again later.");
      console.error("Error:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Register</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = inputFocusStyle.borderColor)}
          onBlur={(e) => (e.target.style.borderColor = "#34495e")}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = inputFocusStyle.borderColor)}
          onBlur={(e) => (e.target.style.borderColor = "#34495e")}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = inputFocusStyle.borderColor)}
          onBlur={(e) => (e.target.style.borderColor = "#34495e")}
        />
        {error && <p style={{ color: "#e74c3c", textAlign: "center" }}>{error}</p>}
        {successMessage && <p style={{ color: "#2ecc71", textAlign: "center" }}>{successMessage}</p>}
        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
        >
          Register
        </button>
      </form>
      <Link to="/login" style={linkStyle}>
        Already registered? Login here
      </Link>
    </div>
  );
};

export default Register;
