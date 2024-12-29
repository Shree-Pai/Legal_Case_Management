import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditProfile = ({ profileData, setProfileData }) => {
  const [formData, setFormData] = useState(profileData || {}); // Default to empty object if profileData is undefined
  const navigate = useNavigate();

  useEffect(() => {
    if (profileData) {
      setFormData(profileData); // Update form data when profileData changes
    }
  }, [profileData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send the updated data to the backend to save in the database
      const response = await axios.post("http://localhost:5000/edit-profile", formData);

      // Assuming response.data contains the updated profile
      if (response.status === 200) {
        // Update the profileData in the parent component (Profile)
        setProfileData(response.data);
        navigate("/"); // Redirect to the Profile page
      } else {
        console.error("Failed to update profile", response);
      }
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  const editProfileStyle = {
    padding: "30px",
    backgroundColor: "#ecf0f1",
    textAlign: "center",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const inputStyle = {
    padding: "8px",
    margin: "10px 0",
    width: "300px",
    borderRadius: "5px",
    border: "1px solid #2c3e50",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
    textDecoration: "none",
  };

  return (
    <div style={editProfileStyle}>
      <h2>Edit Lawyer Profile</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Experience:</label>
        <input
          type="text"
          name="experience"
          value={formData.experience || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Cases Won:</label>
        <input
          type="number"
          name="casesWon"
          value={formData.casesWon || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Cases Lost:</label>
        <input
          type="number"
          name="casesLost"
          value={formData.casesLost || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Phone:</label>
        <input
          type="number"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <label>Date of Birth:</label>
        <input
          type="date"
          name="dob"
          value={formData.dob || ""}
          onChange={handleChange}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
