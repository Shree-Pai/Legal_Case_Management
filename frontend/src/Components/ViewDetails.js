import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const ViewDetails = () => {
  const [viewData, setViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cases');

  useEffect(() => {
    fetchViewData();
  }, [activeTab]);

  const fetchViewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Add Bearer prefix if not present
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await axios.get(`http://localhost:5000/view/${activeTab}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received');
      }

      // Format dates and times if they exist in the data
      const formattedData = response.data.map(item => {
        const newItem = { ...item };
        if (newItem.filing_date) {
          newItem.filing_date = new Date(newItem.filing_date).toLocaleDateString();
        }
        if (newItem.closing_date) {
          newItem.closing_date = new Date(newItem.closing_date).toLocaleDateString();
        }
        if (newItem.appointment_date) {
          newItem.appointment_date = new Date(newItem.appointment_date).toLocaleDateString();
        }
        if (newItem.appointment_time) {
          newItem.appointment_time = new Date(`1970-01-01T${newItem.appointment_time}`).toLocaleTimeString();
        }
        return newItem;
      });

      setViewData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching view data:', err);
      // Show error message but don't redirect
      setError('Failed to fetch view data. Please try refreshing the page.');
      setViewData([]); // Clear any previous data
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!viewData.length) return <p className="no-data">No data available for {activeTab}</p>;

    const columns = Object.keys(viewData[0]);

    return (
      <div className="table-responsive">
        <table className="view-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column}>{column.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viewData.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>{row[column] !== null ? row[column] : 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="view-container">
      <h1>View Details</h1>
      
      <div className="view-tabs">
        <button 
          className={`tab-button ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('cases')}
        >
          Cases
        </button>
        <button 
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
        <button 
          className={`tab-button ${activeTab === 'lawyers' ? 'active' : ''}`}
          onClick={() => setActiveTab('lawyers')}
        >
          Lawyers
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading view data...</div>
      ) : (
        <div className="view-content">
          {renderTable()}
        </div>
      )}
    </div>
  );
};

export default ViewDetails; 