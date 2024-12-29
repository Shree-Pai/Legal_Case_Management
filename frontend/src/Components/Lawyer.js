import React, { useState, useEffect } from 'react';
import { getLawyers, addLawyer, updateLawyer, deleteLawyer } from '../api';
import './styles.css';

const Lawyer = () => {
  const [lawyers, setLawyers] = useState([]);
  const [newLawyer, setNewLawyer] = useState({
    name: '',
    email: '',
    experience_years: '',
    cases_won: '',
    cases_lost: '',
    phone: '',
    address: '',
    date_of_birth: '',
    specialization: ''
  });
  const [editingLawyer, setEditingLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lawyers on component mount
  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const response = await getLawyers();
      setLawyers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch lawyers');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLawyer({ ...newLawyer, [name]: value });
  };

  const handleAddOrUpdateLawyer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate age
    const birthDate = new Date(newLawyer.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 25 || (age === 25 && monthDiff < 0)) {
        setError('Lawyer must be at least 25 years old');
        setLoading(false);
        return;
    }

    try {
        if (editingLawyer) {
            await updateLawyer(editingLawyer.lawyer_id, newLawyer);
            setLawyers(lawyers.map(lawyer => 
                lawyer.lawyer_id === editingLawyer.lawyer_id ? { ...lawyer, ...newLawyer } : lawyer
            ));
            setEditingLawyer(null);
        } else {
            const response = await addLawyer(newLawyer);
            console.log('Add lawyer response:', response);
            if (response.data && response.data.data) {
                setLawyers([...lawyers, response.data.data]);
            }
        }

        // Reset form
        setNewLawyer({
            name: '',
            email: '',
            experience_years: '',
            cases_won: '',
            cases_lost: '',
            phone: '',
            address: '',
            date_of_birth: '',
            specialization: ''
        });
    } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || 'Failed to process lawyer data');
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (lawyer) => {
    setEditingLawyer(lawyer);
    setNewLawyer(lawyer);
  };

  const handleDelete = async (lawyerId) => {
    if (window.confirm('Are you sure you want to delete this lawyer?')) {
      setLoading(true);
      try {
        await deleteLawyer(lawyerId);
        setLawyers(lawyers.filter(lawyer => lawyer.lawyer_id !== lawyerId));
      } catch (error) {
        setError('Failed to delete lawyer');
      } finally {
        setLoading(false);
      }
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    const minAge = 25;
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="container">
      {/* Form Section */}
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
          {editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer'}
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
        
        <form onSubmit={handleAddOrUpdateLawyer} className="form">
          <input
            type="text"
            name="name"
            value={newLawyer.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
          <input
            type="email"
            name="email"
            value={newLawyer.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <input
            type="number"
            name="experience_years"
            value={newLawyer.experience_years}
            onChange={handleInputChange}
            placeholder="Years of Experience"
            required
          />
          <input
            type="number"
            name="cases_won"
            value={newLawyer.cases_won}
            onChange={handleInputChange}
            placeholder="Cases Won"
            required
          />
          <input
            type="number"
            name="cases_lost"
            value={newLawyer.cases_lost}
            onChange={handleInputChange}
            placeholder="Cases Lost"
            required
          />
          <input
            type="tel"
            name="phone"
            value={newLawyer.phone}
            onChange={handleInputChange}
            placeholder="Phone"
            required
          />
          <textarea
            name="address"
            value={newLawyer.address}
            onChange={handleInputChange}
            placeholder="Address"
            required
          />
          <input
            type="date"
            name="date_of_birth"
            value={newLawyer.date_of_birth}
            onChange={handleInputChange}
            max={getMaxDate()}
            required
          />
          <input
            type="text"
            name="specialization"
            value={newLawyer.specialization}
            onChange={handleInputChange}
            placeholder="Specialization"
            required
          />
          <button type="submit" disabled={loading}>
            {editingLawyer ? 'Update Lawyer' : 'Add Lawyer'}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <p>Loading lawyers...</p>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Lawyer Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Cases Won</th>
                  <th>Cases Lost</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lawyers.map((lawyer) => (
                  <tr key={lawyer.lawyer_id}>
                    <td>{lawyer.name}</td>
                    <td>{lawyer.email}</td>
                    <td>{lawyer.experience_years} years</td>
                    <td>{lawyer.cases_won}</td>
                    <td>{lawyer.cases_lost}</td>
                    <td>{lawyer.phone}</td>
                    <td>{lawyer.specialization}</td>
                    <td>
                      <button className="edit" onClick={() => handleEdit(lawyer)}>
                        Edit
                      </button>
                      <button className="delete" onClick={() => handleDelete(lawyer.lawyer_id)}>
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

export default Lawyer;
