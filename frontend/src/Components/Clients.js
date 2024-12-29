import React, { useState, useEffect } from 'react';
import './styles.css';
import { getClients, addClient, updateClient, deleteClient, getLawyers } from '../api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]); // State for lawyers
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    lawyer_id: ''
  });
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch clients and lawyers when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsResponse, lawyersResponse] = await Promise.all([
        getClients(),
        getLawyers()
      ]);
      setClients(clientsResponse.data);
      setLawyers(lawyersResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const handleAddOrUpdateClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingClient) {
        const response = await updateClient(editingClient.client_id, newClient);
        setClients(clients.map(client =>
          client.client_id === editingClient.client_id ? response.data.data : client
        ));
        setEditingClient(null);
      } else {
        const response = await addClient(newClient);
        if (response.data && response.data.data) {
          setClients([...clients, response.data.data]);
        }
      }

      // Reset form
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        lawyer_id: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process client');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setNewClient(client);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setLoading(true);
      try {
        await deleteClient(clientId);
        setClients(clients.filter(client => client.client_id !== clientId));
      } catch (err) {
        setError('Failed to delete client');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function to get lawyer name
  const getLawyerName = (lawyerId) => {
    const lawyer = lawyers.find(l => l.lawyer_id === lawyerId);
    return lawyer ? lawyer.name : 'Not Assigned';
  };

  return (
    <div className="container">
      {/* Form Section */}
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
          {editingClient ? 'Edit Client' : 'Add Client'}
        </h2>

        {error && (
          <div style={{
            color: '#ff6b6b',
            backgroundColor: '#2c3e50',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAddOrUpdateClient} className="form">
          <input
            type="text"
            name="name"
            value={newClient.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
          <input
            type="email"
            name="email"
            value={newClient.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <input
            type="tel"
            name="phone"
            value={newClient.phone}
            onChange={handleInputChange}
            placeholder="Phone"
            required
          />
          <textarea
            name="address"
            value={newClient.address}
            onChange={handleInputChange}
            placeholder="Address"
            required
          />
          <select
            name="lawyer_id"
            value={newClient.lawyer_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Lawyer</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer.lawyer_id} value={lawyer.lawyer_id}>
                {lawyer.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {editingClient ? 'Update Client' : 'Add Client'}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <p>Loading clients...</p>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Client Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Lawyer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.client_id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.address}</td>
                    <td>{getLawyerName(client.lawyer_id)}</td>
                    <td>
                      <button className="edit" onClick={() => handleEdit(client)}>
                        Edit
                      </button>
                      <button className="delete" onClick={() => handleDelete(client.client_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Clients;
