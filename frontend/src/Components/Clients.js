import React, { useState, useEffect } from 'react';
import './styles.css'; // Import the updated theme
import axios from 'axios'; // To handle HTTP requests

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [editingClient, setEditingClient] = useState(null); // Track editing state
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Fetch clients from the backend when the component is mounted
  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5000/clients') // Ensure the correct backend URL with port 5000
      .then((response) => {
        setClients(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to fetch clients');
        setLoading(false);
      });
  }, []);

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  // Handle add or update client submission
  const handleAddOrUpdateClient = (e) => {
    e.preventDefault();
    setLoading(true);
    if (editingClient) {
      // Update existing client
      axios
        .put(`http://localhost:5000/clients/${editingClient.client_id}`, newClient) // Update the URL with the port
        .then((response) => {
          setClients(
            clients.map((client) =>
              client.client_id === editingClient.client_id ? { ...client, ...newClient } : client
            )
          );
          setEditingClient(null);
          setLoading(false);
        })
        .catch((error) => {
          setError('Failed to update client');
          setLoading(false);
        });
    } else {
      // Add new client
      axios
        .post('http://localhost:5000/clients', newClient) // Update the URL with the port
        .then((response) => {
          setClients([...clients, response.data]);
          setLoading(false);
        })
        .catch((error) => {
          setError('Failed to add new client');
          setLoading(false);
        });
    }
    setNewClient({ name: '', email: '', phone: '', address: '' });
  };

  // Handle editing a client
  const handleEdit = (client) => {
    setEditingClient(client);
    setNewClient(client);
  };

  // Handle deleting a client
  const handleDelete = (client_id) => {
    setLoading(true);
    axios
      .delete(`http://localhost:5000/clients/${client_id}`) // Update the URL with the port
      .then(() => {
        setClients(clients.filter((client) => client.client_id !== client_id));
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to delete client');
        setLoading(false);
      });
  };

  return (
    <div className="container">
      {/* Form Section */}
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Clients</h2>

        {error && <p className="error">{error}</p>}
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
            type="number"
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
