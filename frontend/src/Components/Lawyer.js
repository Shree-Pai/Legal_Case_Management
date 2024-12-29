import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Lawyer = ({ profileData, setProfileData }) => {
  const [formData, setFormData] = useState(profileData || {});
  const [lawyers, setLawyers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }

    // Fetch list of all lawyers
    const fetchLawyers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/lawyers");
        setLawyers(response.data);
      } catch (error) {
        console.error("Error fetching lawyers:", error);
      }
    };

    fetchLawyers();
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
      const response = await axios.put(
        `http://localhost:5000/lawyers/${formData.lawyer_id}`,
        formData
      );

      if (response.status === 200) {
        setProfileData(response.data);
        navigate("/"); // Redirect to Profile page
      } else {
        console.error("Failed to update profile", response);
      }
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  const handleDelete = async (lawyerId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/lawyers/${lawyerId}`
      );

      if (response.status === 200) {
        setLawyers(lawyers.filter((lawyer) => lawyer.lawyer_id !== lawyerId));
      } else {
        console.error("Failed to delete lawyer", response);
      }
    } catch (error) {
      console.error("Error deleting lawyer:", error);
    }
  };

  const formContainerStyle = {
    display: "flex",
    flexDirection: "column", // Stack the form fields vertically
    gap: "25px", // Space between rows
    marginTop: "30px",
    maxWidth: "900px",
    margin: "0 auto", // Center the form
    backgroundColor: "#34495e", // Form background color
    padding: "20px", // Add padding to the form for better spacing
    borderRadius: "8px", // Optional: Add border radius for rounded corners
  };

  const inputWrapperStyle = {
    display: "flex",
    flexDirection: "row", // Side by side layout
    justifyContent: "space-between", // Space between label and input
    gap: "20px", // Gap between label and input
    marginBottom: "15px", // Space between rows
  };

  const labelStyle = {
    flex: 1,
    fontWeight: "bold",
    alignSelf: "center", // Vertically center the label
    color: "#fff", // Change label color to white
  };

  const inputStyle = {
    flex: 2,
    padding: "10px",
    fontSize: "14px",
    width: "100%",
    borderRadius: "5px",
    border: "1px solid #ddd",
    backgroundColor: "#f4f4f4",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  };

  const buttonStyle = {
    padding: "8px 15px",
    backgroundColor: "#3498db",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "20px",
    width: "150px", // Smaller button
    alignSelf: "flex-start", // Align to the left
  };


  return (
    <div>
      {/* Lawyers Heading */}


      {/* Form for Editing Lawyer Profile */}
      <div>

        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "30px", backgroundColor: "34495e" }}>
            Lawyers
          </h2>
          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              style={inputStyle}
            />
            <label style={labelStyle}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Experience:</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years || ""}
              onChange={handleChange}
              style={inputStyle}
            />
            <label style={labelStyle}>Cases Won:</label>
            <input
              type="number"
              name="cases_won"
              value={formData.cases_won || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Cases Lost:</label>
            <input
              type="number"
              name="cases_lost"
              value={formData.cases_lost || ""}
              onChange={handleChange}
              style={inputStyle}
            />
            <label style={labelStyle}>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              style={inputStyle}
            />
            <label style={labelStyle}>Date of Birth:</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={inputWrapperStyle}>
            <label style={labelStyle}>Specialization:</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Save Changes
          </button>
        </form>
      </div>
      <p></p>
      <p></p>
      {/* Lawyers Table */}
      {/* Table Section */}
      <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Lawyers List</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Email</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Experience</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Cases Won</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Cases Lost</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lawyers.map((lawyer) => (
              <tr key={lawyer.lawyer_id}>
                <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                  {lawyer.name}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                  {lawyer.email}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                  {lawyer.experience_years}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                  {lawyer.cases_won}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                  {lawyer.cases_lost}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                  <button
                    onClick={() => {
                      setFormData(lawyer); // Populate the form with the selected lawyer's data
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      marginRight: '10px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lawyer.lawyer_id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '5px',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Lawyer;
