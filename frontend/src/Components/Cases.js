import React, { useState, useEffect } from 'react';
import './styles.css';
import { getCases, addCase, updateCase, deleteCase, getClients, getLawyers } from '../api';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    status: '',
    client_id: '',
    lawyer_id: ''
  });
  const [editingCase, setEditingCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status options from the database schema
  const statusOptions = [
    'Open',
    'In Progress',
    'Closed',
    'Under Review',
    'Awaiting Judgment'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesResponse, clientsResponse, lawyersResponse] = await Promise.all([
        getCases(),
        getClients(),
        getLawyers()
      ]);
      console.log('Cases data:', casesResponse.data); // Debug log
      setCases(Array.isArray(casesResponse.data) ? casesResponse.data : []);
      setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : []);
      setLawyers(Array.isArray(lawyersResponse.data) ? lawyersResponse.data : []);
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
    setNewCase({ ...newCase, [name]: value });

    // Auto-fill lawyer when client is selected
    if (name === 'client_id') {
      const selectedClient = clients.find(client => client.client_id.toString() === value);
      if (selectedClient) {
        setNewCase(prev => ({
          ...prev,
          lawyer_id: selectedClient.lawyer_id.toString()
        }));
      }
    }
  };

  const handleAddOrUpdateCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        if (editingCase) {
            const response = await updateCase(editingCase.case_id, {
                ...newCase,
                client_id: parseInt(newCase.client_id),
                lawyer_id: parseInt(newCase.lawyer_id)
            });
            
            // Check if response has data property
            const updatedCase = response.data?.data || response.data;
            
            setCases(prevCases => prevCases.map(caseItem =>
                caseItem.case_id === editingCase.case_id ? updatedCase : caseItem
            ));
            setEditingCase(null);
        } else {
            const response = await addCase({
                ...newCase,
                client_id: parseInt(newCase.client_id),
                lawyer_id: parseInt(newCase.lawyer_id)
            });
            console.log('Add case response:', response);
            if (response.data && response.data.data) {
                setCases(prevCases => [...prevCases, response.data.data]);
            }
        }

        // Reset form
        setNewCase({
            title: '',
            description: '',
            status: '',
            client_id: '',
            lawyer_id: ''
        });
    } catch (err) {
        console.error('Error processing case:', err);
        setError(err.response?.data?.message || 'Failed to process case');
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (caseItem) => {
    setEditingCase(caseItem);
    setNewCase(caseItem);
  };

  const handleDelete = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      setLoading(true);
      try {
        await deleteCase(caseId);
        setCases(cases.filter(caseItem => caseItem.case_id !== caseId));
      } catch (err) {
        setError('Failed to delete case');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper functions to get names
  const getClientName = (clientId) => {
    const client = clients.find(c => c.client_id === clientId);
    return client ? client.name : 'Not Assigned';
  };

  const getLawyerName = (lawyerId) => {
    const lawyer = lawyers.find(l => l.lawyer_id === lawyerId);
    return lawyer ? lawyer.name : 'Not Assigned';
  };

  return (
    <div className="container">
      {/* Form Section */}
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
          {editingCase ? 'Edit Case' : 'Add Case'}
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

        <form onSubmit={handleAddOrUpdateCase} className="form">
          <input
            type="text"
            name="title"
            value={newCase.title}
            onChange={handleInputChange}
            placeholder="Case Title"
            required
          />
          <textarea
            name="description"
            value={newCase.description}
            onChange={handleInputChange}
            placeholder="Case Description"
            required
          />
          <select
            name="status"
            value={newCase.status}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            name="client_id"
            value={newCase.client_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.client_id} value={client.client_id}>
                {client.name}
              </option>
            ))}
          </select>
          <select
            name="lawyer_id"
            value={newCase.lawyer_id}
            onChange={handleInputChange}
            required
            disabled // Disabled because it's auto-filled based on client selection
          >
            <option value="">Select Lawyer</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer.lawyer_id} value={lawyer.lawyer_id}>
                {lawyer.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {editingCase ? 'Update Case' : 'Add Case'}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <p>Loading cases...</p>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Case Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Client</th>
                  <th>Lawyer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.case_id}>
                    <td>{caseItem.title}</td>
                    <td>{caseItem.description}</td>
                    <td>{caseItem.status}</td>
                    <td>{getClientName(caseItem.client_id)}</td>
                    <td>{getLawyerName(caseItem.lawyer_id)}</td>
                    <td>
                      <button className="edit" onClick={() => handleEdit(caseItem)}>
                        Edit
                      </button>
                      <button className="delete" onClick={() => handleDelete(caseItem.case_id)}>
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

export default Cases;
