import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LawyerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    lawyer_id: '',
    date: '',
    time: '',  // Change to empty string for time
  });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingData, setLoadingData] = useState(true);  // For data fetching state
  const [error, setError] = useState(null);  // To handle errors

  // Fetch lawyers, clients, and appointments from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lawyers and clients
        const [lawyersResponse, clientsResponse] = await Promise.all([
          axios.get('http://localhost:5000/profile'),
          axios.get('http://localhost:5000/clients'),
        ]);
        setLawyers(lawyersResponse.data);
        setClients(clientsResponse.data);

        // Fetch appointments
        const appointmentsResponse = await axios.get('http://localhost:5000/appointments');
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        setError('Error fetching data. Please try again later.');
      } finally {
        setLoadingData(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment({ ...newAppointment, [name]: value });
  };

  const handleAddOrUpdateAppointment = (e) => {
    e.preventDefault();
    const formattedAppointment = { 
      ...newAppointment,
      time: newAppointment.time || ''  // Keep time as-is
    };

    if (editingAppointment) {
      // Update appointment
      axios.put(`http://localhost:5000/appointments/${editingAppointment.appointment_id}`, formattedAppointment)
        .then(response => {
          const updatedAppointments = appointments.map((appointment) =>
            appointment.appointment_id === editingAppointment.appointment_id ? { ...appointment, ...formattedAppointment } : appointment
          );
          setAppointments(updatedAppointments);
          setEditingAppointment(null); // Reset editing state
        })
        .catch(error => console.error('Error updating appointment:', error));
    } else {
      // Add new appointment
      axios.post('http://localhost:5000/appointments', formattedAppointment)
        .then(response => {
          setAppointments([...appointments, response.data]);
        })
        .catch(error => console.error('Error adding appointment:', error));
    }
    setNewAppointment({ client_id: '', lawyer_id: '', date: '', time: '' });  // Reset to default empty time
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment); // Set the appointment to be edited
    setNewAppointment(appointment); // Populate form with existing appointment details
  };

  const handleDelete = (appointmentId) => {
    axios.delete(`http://localhost:5000/appointments/${appointmentId}`)
      .then(() => {
        setAppointments(appointments.filter((appointment) => appointment.appointment_id !== appointmentId)); // Remove appointment by ID
      })
      .catch(error => console.error('Error deleting appointment:', error));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Form Section */}
      <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Lawyer Appointments</h2>
        <form onSubmit={handleAddOrUpdateAppointment} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            <select
              name="client_id"
              value={newAppointment.client_id}
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
              {clients.length ? (
                clients.map((client) => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.name}
                  </option>
                ))
              ) : (
                <option value="">No Clients Available</option>
              )}
            </select>

            <select
              name="lawyer_id"
              value={newAppointment.lawyer_id}
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
              <option value="" disabled>Select Lawyer</option>
              {lawyers.length ? (
                lawyers.map((lawyer) => (
                  <option key={lawyer.lawyer_id} value={lawyer.lawyer_id}>
                    {lawyer.name}
                  </option>
                ))
              ) : (
                <option value="">No Lawyers Available</option>
              )}
            </select>

            <input
              type="date"
              name="date"
              value={newAppointment.date}
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
            />
            <input
              type="text"  // Change to text input
              name="time"
              value={newAppointment.time}
              onChange={handleInputChange}
              required
              placeholder="HH:mm:ss" // Inform user of the expected time format
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#34495e',
                color: '#fff',
                fontSize: '14px',
              }}
            />
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
              {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && <div style={{ backgroundColor: '#FF4D4D', color: 'white', padding: '10px', textAlign: 'center' }}>{error}</div>}

      {/* Table Section */}
      <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        {loadingData ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Loading data...</p>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Appointment Details</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Client</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Lawyer</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Date</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Time</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.appointment_id}>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff' }}>
                      {clients.find((client) => client.client_id === appointment.client_id)?.name}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff' }}>
                      {lawyers.find((lawyer) => lawyer.lawyer_id === appointment.lawyer_id)?.name}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff' }}>{appointment.appointment_date}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff' }}>{appointment.appointment_time}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                      <button
                        onClick={() => handleEdit(appointment)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#FFC107',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '5px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.appointment_id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#FF4D4D',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          marginLeft: '10px',
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

export default LawyerAppointments;
