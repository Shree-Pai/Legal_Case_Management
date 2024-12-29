import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LawyerSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    time: '',
    court: '',
    appointment: '',
    status: 'Pending',
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Fetch schedules from the backend
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/lawyer-schedule');
        setSchedules(response.data); // Set fetched schedules
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  const handleAddOrUpdateSchedule = async (e) => {
    e.preventDefault();
    if (editingSchedule) {
      // Update schedule
      try {
        await axios.put(`http://localhost:5000/lawyer-schedule  /${editingSchedule.schedule_id}`, newSchedule);
        setSchedules(
          schedules.map((schedule) =>
            schedule.schedule_id === editingSchedule.schedule_id
              ? { ...schedule, ...newSchedule }
              : schedule
          )
        );
        setEditingSchedule(null); // Reset editing state
      } catch (error) {
        console.error('Error updating schedule:', error);
      }
    } else {
      // Add new schedule
      try {
        const response = await axios.post('http://localhost:5000/lawyer-schedule', newSchedule);
        const addedSchedule = response.data;
        setSchedules([...schedules, addedSchedule]); // Add the new schedule to the list
      } catch (error) {
        console.error('Error adding schedule:', error);
      }
    }
    setNewSchedule({ date: '', time: '', court: '', appointment: '', status: 'Pending' });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule); // Set the schedule to be edited
    setNewSchedule(schedule); // Populate form with existing schedule details
  };

  const handleDelete = async (scheduleId) => {
    try {
      await axios.delete(`http://localhost:5000/lawyer-schedule/${scheduleId}`);
      setSchedules(schedules.filter((schedule) => schedule.schedule_id !== scheduleId)); // Remove schedule from the list
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Form Section */}
      <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Daily Lawyer Schedule</h2>
        <form onSubmit={handleAddOrUpdateSchedule} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              type="date"
              name="date"
              value={newSchedule.date}
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
              type="time"
              name="time"
              value={newSchedule.time}
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
              type="text"
              name="court"
              value={newSchedule.court}
              onChange={handleInputChange}
              placeholder="Court Name/Location"
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
              type="text"
              name="appointment"
              value={newSchedule.appointment}
              onChange={handleInputChange}
              placeholder="Appointment Details"
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
            <select
              name="status"
              value={newSchedule.status}
              onChange={handleInputChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#34495e',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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
              {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
        {loadingSchedules ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Loading schedules...</p>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>Lawyer Schedule Details</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Date</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Time</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Court</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Appointment</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Status</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#34495e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.schedule_id}>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>{schedule.date}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>{schedule.time}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>{schedule.court}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>{schedule.appointment}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>{schedule.status}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', color: '#fff', backgroundColor: '#2c3e50' }}>
                      <button
                        onClick={() => handleEdit(schedule)}
                        style={{
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginRight: '10px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.schedule_id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer',
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

export default LawyerSchedule;
