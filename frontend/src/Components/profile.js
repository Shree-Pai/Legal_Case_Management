import React, { useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import axios from "axios";
import EditProfile from "./EditProfile";

const Profile = () => {
  const [profileData, setProfileData] = useState(null); // State for profile data
  const [loading, setLoading] = useState(true);

  // Fetch the user token from localStorage
  const userToken = localStorage.getItem("userToken");

  // Fetch profile data for the logged-in user
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userToken) {
        console.error("No user token found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userToken]);

  const profileStyle = {
    padding: "30px",
    backgroundColor: "#ecf0f1",
    textAlign: "center",
  };

  const profileDetailStyle = {
    margin: "20px",
    padding: "15px",
    backgroundColor: "#34495e",
    color: "#ffffff",
    display: "inline-block",
    width: "300px",
    textAlign: "left",
    borderRadius: "5px",
  };

  const profileImageStyle = {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    marginBottom: "20px",
    objectFit: "cover",
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

  if (loading) {
    return <div style={profileStyle}>Loading...</div>;
  }

  if (!profileData) {
    return <div style={profileStyle}>Profile data not available</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={profileStyle}>
            <h2>Lawyer Profile</h2>
            {profileData.profilePicture && (
              <img
                src={profileData.profilePicture}
                alt="Profile"
                style={profileImageStyle}
              />
            )}
            <div style={profileDetailStyle}>
              <strong>Name:</strong> {profileData.name}
            </div>
            <div style={profileDetailStyle}>
              <strong>Email:</strong> {profileData.email}
            </div>
            <div style={profileDetailStyle}>
              <strong>Experience:</strong> {profileData.experience || "N/A"}
            </div>
            <div style={profileDetailStyle}>
              <strong>Cases Won:</strong> {profileData.casesWon || "N/A"}
            </div>
            <div style={profileDetailStyle}>
              <strong>Cases Lost:</strong> {profileData.casesLost || "N/A"}
            </div>
            <div style={profileDetailStyle}>
              <strong>Phone:</strong> {profileData.phone || "N/A"}
            </div>
            <div style={profileDetailStyle}>
              <strong>Address:</strong> {profileData.address || "N/A"}
            </div>
            <div style={profileDetailStyle}>
              <strong>Date of Birth:</strong> {profileData.dob || "N/A"}
            </div>
            <Link to="/edit-profile" style={buttonStyle}>
              Edit Profile
            </Link>
          </div>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <EditProfile profileData={profileData} setProfileData={setProfileData} />
        }
      />
    </Routes>
  );
};

export default Profile;
