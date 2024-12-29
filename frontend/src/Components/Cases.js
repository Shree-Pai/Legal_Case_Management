import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CaseDetails = () => {
  const [cases, setCases] = useState([]);
  const [newCase, setNewCase] = useState({ title: '', description: '', status: '', client_id: '' });
  const [editingCase, setEditingCase] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [clients, setClients] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    // Fetch clients from the backend
    const fetchClients = async () => {
      try {
        const clientResponse = await axios.get('http://localhost:5000/clients'); // Adjust URL as per your backend API
        setClients(clientResponse.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    // Fetch cases from the backend
    const fetchCases = async () => {
      try {
        const caseResponse = await axios.get('http://localhost:5000/cases'); // Adjust URL as per your backend API
        setCases(caseResponse.data);
        setLoadingCases(false);
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    fetchClients();
    fetchCases();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCase({ ...newCase, [name]: value });
  };

  const handleAddOrUpdateCase = async (e) => {
    e.preventDefault();
    if (editingCase) {
      // Update case
      try {
        await axios.put(`http://localhost:5000/cases/${editingCase.case_id}`, newCase); // Update case in the backend
        setCases(
          cases.map((caseItem) =>
            caseItem.case_id === editingCase.case_id ? { ...caseItem, ...newCase } : caseItem
          )
        );
        setEditingCase(null);
      } catch (error) {
        console.error('Error updating case:', error);
      }
    } else {
      // Add new case
      try {
        const response = await axios.post('http://localhost:5000/cases', newCase); // Add new case to the backend
        const newCaseWithId = { ...newCase, case_id: response.data.case_id };
        setCases([...cases, newCaseWithId]);
      } catch (error) {
        console.error('Error adding case:', error);
      }
    }
    setNewCase({ title: '', description: '', status: '', client_id: '' });
  };

  const handleEdit = (caseItem) => {
    setEditingCase(caseItem);
    setNewCase(caseItem);
  };

  const handleDelete = async (caseId) => {
    try {
      await axios.delete(`http://localhost:5000/cases/${caseId}`); // Delete case from the backend
      setCases(cases.filter((caseItem) => caseItem.case_id !== caseId));
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((client) => client.client_id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const handleClientChange = async (caseId, clientId) => {
    try {
      await axios.put(`http://localhost:5000/cases/${caseId}`, { client_id: clientId }); // Update client for case in the backend
      setCases(
        cases.map((caseItem) =>
          caseItem.case_id === caseId ? { ...caseItem, client_id: clientId } : caseItem
        )
      );
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Form Section */}
      <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Case Details</h2>
        <form onSubmit={handleAddOrUpdateCase} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              type="text"
              name="title"
              value={newCase.title}
              onChange={handleInputChange}
              placeholder="Case Title"
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#34495e',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            <textarea
              name="description"
              value={newCase.description}
              onChange={handleInputChange}
              placeholder="Case Description"
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#34495e',
                color: '#fff',
                fontSize: '14px',
                height: '100px',
              }}
            ></textarea>
            <select
              name="status"
              value={newCase.status}
              onChange={handleInputChange}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#34495e',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <option value="" disabled>Select Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              name="client_id"
              value={newCase.client_id}
              onChange={handleInputChange}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#34495e',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <option value="" disabled>Select Client</option>
              {clients.map((client) => (
                <option key={client.client_id} value={client.client_id}>
                  {client.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                padding: '10px',
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              {editingCase ? 'Update Case' : 'Add Case'}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        {loadingCases ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Loading cases...</p>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Case Details</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Title</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Description</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Client</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Status</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.case_id}>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                      {caseItem.title}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                      {caseItem.description}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                      {editingCase && editingCase.case_id === caseItem.case_id ? (
                        <select
                          value={caseItem.client_id}
                          onChange={(e) => handleClientChange(caseItem.case_id, e.target.value)}
                          style={{
                            padding: '5px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            backgroundColor: '#34495e',
                            color: '#fff',
                            fontSize: '14px',
                          }}
                        >
                          {clients.map((client) => (
                            <option key={client.client_id} value={client.client_id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getClientName(caseItem.client_id)
                      )}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                      {caseItem.status}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                      <button
                        onClick={() => handleEdit(caseItem)}
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
                        onClick={() => handleDelete(caseItem.case_id)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
