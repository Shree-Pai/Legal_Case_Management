import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';
import './styles.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('userToken');
      
      if (!adminId || !token) {
        throw new Error('Please login again');
      }

      const data = await getProfile(adminId);
      if (data) {
        setProfile(prevProfile => ({
          ...prevProfile,
          name: data.name,
          email: data.email
        }));
        setError(null);
      } else {
        throw new Error('No profile data received');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
      
      // Handle authentication errors
      if (err.message.includes('authentication') || err.response?.status === 422) {
        localStorage.clear(); // Clear all stored data
        window.location.href = '/login'; // Redirect to login
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Validate password match if changing password
      if (profile.password && profile.password !== profile.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const adminId = localStorage.getItem('adminId');
      const updateData = {
        name: profile.name,
        email: profile.email
      };

      // Only include password if it's being changed
      if (profile.password) {
        updateData.password = profile.password;
      }

      const response = await updateProfile(adminId, updateData);
      setSuccessMessage('Profile updated successfully');
      setEditing(false);
      
      // Clear password fields
      setProfile(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editing) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {!editing ? (
          <div className="profile-info">
            <div className="info-group">
              <label>Name:</label>
              <p>{profile.name}</p>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <p>{profile.email}</p>
            </div>
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>New Password: (Leave blank to keep current)</label>
              <input
                type="password"
                name="password"
                value={profile.password}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={profile.confirmPassword}
                onChange={handleInputChange}
              />
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading}>
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  fetchProfile();
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
