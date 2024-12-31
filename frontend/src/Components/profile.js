import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';

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

      if (err.message.includes('authentication') || err.response?.status === 422) {
        localStorage.clear();
        window.location.href = '/login';
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
      if (profile.password && profile.password !== profile.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const adminId = localStorage.getItem('adminId');
      const updateData = {
        name: profile.name,
        email: profile.email
      };

      if (profile.password) {
        updateData.password = profile.password;
      }

      const response = await updateProfile(adminId, updateData);
      setSuccessMessage('Profile updated successfully');
      setEditing(false);

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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("https://static.wixstatic.com/media/e1b86d_650c913c766444b3ba500e6a2d3fff13~mv2.jpeg/v1/fill/w_961,h_420,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/e1b86d_650c913c766444b3ba500e6a2d3fff13~mv2.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff'
        }}
      >
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("https://static.wixstatic.com/media/e1b86d_650c913c766444b3ba500e6a2d3fff13~mv2.jpeg/v1/fill/w_961,h_420,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/e1b86d_650c913c766444b3ba500e6a2d3fff13~mv2.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff'
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '20px',
          width: '90%',
          maxWidth: editing ? '600px' : '500px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}
      >
        <h1 style={{ textAlign: 'center' }}>Profile</h1>

        {error && (
          <div
            style={{
              backgroundColor: '#ff4d4d',
              padding: '10px',
              borderRadius: '5px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            style={{
              backgroundColor: '#4caf50',
              padding: '10px',
              borderRadius: '5px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {successMessage}
          </div>
        )}

        {!editing ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Name:</strong> {profile.name}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Email:</strong> {profile.email}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <label>New Password:</label>
              <input
                type="password"
                name="password"
                value={profile.password}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <label>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={profile.confirmPassword}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: '1'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  fetchProfile();
                }}
                style={{
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: '1'
                }}
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
