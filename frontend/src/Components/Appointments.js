import React, { useState, useEffect } from 'react';
import './styles.css';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, getClients, getLawyers, getCases } from '../api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [cases, setCases] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    lawyer_id: '',
    case_id: '',
    date: '',
    time: '',
    appointment_status: 'Scheduled'
  });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsResponse, clientsResponse, lawyersResponse, casesResponse] = await Promise.all([
        getAppointments(),
        getClients(),
        getLawyers(),
        getCases()
      ]);

      const appointmentsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
      const clientsData = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];
      const lawyersData = Array.isArray(lawyersResponse.data) ? lawyersResponse.data : [];
      const casesData = Array.isArray(casesResponse.data) ? casesResponse.data : [];

      console.log('Fetched Data:', {
        appointments: appointmentsData,
        clients: clientsData,
        lawyers: lawyersData,
        cases: casesData
      });

      setAppointments(appointmentsData);
      setClients(clientsData);
      setLawyers(lawyersData);
      setCases(casesData);
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
    setNewAppointment(prev => ({ ...prev, [name]: value }));

    // Auto-fill lawyer and case when client is selected
    if (name === 'client_id' && value) {
      const selectedClient = clients.find(client => client.client_id && client.client_id.toString() === value);
      if (selectedClient) {
        // Find the lawyer associated with this client
        const clientLawyer = lawyers.find(lawyer => lawyer.lawyer_id === selectedClient.lawyer_id);
        
        // Find all cases where this client is involved
        const clientCases = cases.filter(c => 
          c.client_id && c.client_id.toString() === value
        );
        
        console.log('Selected Client:', selectedClient);
        console.log('Client Cases:', clientCases);
        console.log('Available Cases:', cases);

        // First, update lawyer_id
        const updatedAppointment = {
          ...newAppointment,
          client_id: value,
          lawyer_id: clientLawyer ? clientLawyer.lawyer_id.toString() : ''
        };

        // Then, if there are cases available, set the first one
        if (clientCases && clientCases.length > 0) {
          updatedAppointment.case_id = clientCases[0].case_id.toString();
          console.log('Auto-selecting case:', clientCases[0]);
        } else {
          updatedAppointment.case_id = '';
          console.log('No cases found for client');
        }

        setNewAppointment(updatedAppointment);
      }
    }
  };

  const isValidTime = (timeStr) => {
    const [hours] = timeStr.split(':').map(Number);
    return hours >= 9 && hours < 18; // 9 AM to 6 PM
  };

  const handleAddOrUpdateAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['client_id', 'lawyer_id', 'case_id', 'date', 'time'];
      for (const field of requiredFields) {
        if (!newAppointment[field]) {
          throw new Error(`${field.replace('_', ' ')} is required`);
        }
      }

      // Validate time
      if (!isValidTime(newAppointment.time)) {
        throw new Error('Appointment time must be between 9:00 AM and 6:00 PM');
      }

      // Format date and time
      const formattedData = {
        ...newAppointment,
        client_id: parseInt(newAppointment.client_id),
        lawyer_id: parseInt(newAppointment.lawyer_id),
        case_id: parseInt(newAppointment.case_id),
        date: newAppointment.date,
        time: newAppointment.time.includes(':') ? newAppointment.time : `${newAppointment.time}:00`
      };

      console.log('Sending appointment data:', formattedData);

      if (editingAppointment) {
        const response = await updateAppointment(editingAppointment.appointment_id, formattedData);
        console.log('Update response:', response);
        setAppointments(prevAppointments => prevAppointments.map(appointment =>
          appointment.appointment_id === editingAppointment.appointment_id ? response.data.data : appointment
        ));
        setEditingAppointment(null);
      } else {
        const response = await addAppointment(formattedData);
        console.log('Add response:', response);
        if (response.data && response.data.data) {
          setAppointments(prevAppointments => [...prevAppointments, response.data.data]);
        }
      }

      // Reset form
      setNewAppointment({
        client_id: '',
        lawyer_id: '',
        case_id: '',
        date: '',
        time: '',
        appointment_status: 'Scheduled'
      });

      // Refresh the appointments list
      fetchData();
    } catch (err) {
      console.error('Error processing appointment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      client_id: appointment.client_id.toString(),
      lawyer_id: appointment.lawyer_id.toString(),
      case_id: appointment.case_id ? appointment.case_id.toString() : '',
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      appointment_status: appointment.appointment_status
    });
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setLoading(true);
      try {
        await deleteAppointment(appointmentId);
        setAppointments(appointments.filter(appointment => appointment.appointment_id !== appointmentId));
      } catch (err) {
        setError('Failed to delete appointment');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper functions
  const getClientName = (clientId) => {
    if (!clientId) return 'Not Assigned';
    const client = clients.find(c => c.client_id === clientId);
    return client ? client.name : 'Not Assigned';
  };

  const getLawyerName = (lawyerId) => {
    if (!lawyerId) return 'Not Assigned';
    const lawyer = lawyers.find(l => l.lawyer_id === lawyerId);
    return lawyer ? lawyer.name : 'Not Assigned';
  };

  const getCaseTitle = (caseId) => {
    if (!caseId) return 'Not Assigned';
    const caseItem = cases.find(c => c.case_id === caseId);
    return caseItem ? caseItem.title : 'Not Assigned';
  };

  const getCaseOptions = () => {
    if (!newAppointment.client_id) return [];
    
    const clientCases = cases.filter(c => 
      c.client_id && c.client_id.toString() === newAppointment.client_id
    );
    
    console.log('Filtered cases for dropdown:', clientCases);
    return clientCases;
  };

  return (
    <div className="container">
      {/* Form Section */}
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
          {editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
        </h2>

        <div className="helper-message">
          Note: Appointments are available between 9:00 AM and 6:00 PM
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleAddOrUpdateAppointment} className="form">
          <select
            name="client_id"
            value={newAppointment.client_id}
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
            value={newAppointment.lawyer_id}
            onChange={handleInputChange}
            required
            disabled
          >
            <option value="">Select Lawyer</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer.lawyer_id} value={lawyer.lawyer_id}>
                {lawyer.name}
              </option>
            ))}
          </select>

          <select
            name="case_id"
            value={newAppointment.case_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Case</option>
            {getCaseOptions().map((caseItem) => (
              <option key={caseItem.case_id} value={caseItem.case_id}>
                {`${caseItem.title} - ${caseItem.status}`}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={newAppointment.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />

          <input
            type="time"
            name="time"
            value={newAppointment.time}
            onChange={handleInputChange}
            min="09:00"
            max="18:00"
            step="1"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
            required
            onBlur={(e) => {
              // Ensure time has seconds and is within valid range
              if (e.target.value) {
                if (!isValidTime(e.target.value)) {
                  setError('Appointment time must be between 9:00 AM and 6:00 PM');
                  return;
                }
                setNewAppointment(prev => ({
                  ...prev,
                  time: e.target.value.includes(':') ? e.target.value : `${e.target.value}:00`
                }));
              }
            }}
          />

          <select
            name="appointment_status"
            value={newAppointment.appointment_status}
            onChange={handleInputChange}
            required
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button type="submit" disabled={loading}>
            {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading appointments...</div>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Appointment Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Lawyer</th>
                  <th>Case</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.appointment_id}>
                    <td>{getClientName(appointment.client_id)}</td>
                    <td>{getLawyerName(appointment.lawyer_id)}</td>
                    <td>{getCaseTitle(appointment.case_id)}</td>
                    <td>{appointment.appointment_date}</td>
                    <td>{appointment.appointment_time}</td>
                    <td>{appointment.appointment_status}</td>
                    <td>
                      <button className="edit" onClick={() => handleEdit(appointment)}>
                        Edit
                      </button>
                      <button className="delete" onClick={() => handleDelete(appointment.appointment_id)}>
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

export default Appointments;
