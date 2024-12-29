import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Update the base URL as needed

// ------------------- Authentication API -------------------

// Register API
export const register = async (data) => {
  // `data` should include { name, email, password }
  const response = await axios.post(`${API_URL}/admin/register`, data);
  return response.data; // Expected response: { name, email, token }
};

// Login API
export const login = async (data) => {
  try {
    console.log('Attempting login with:', data);
    const response = await axios.post(`${API_URL}/admin/login`, data);
    console.log('Login response:', response.data);

    if (response.data.token) {
      // Store token with Bearer prefix
      localStorage.setItem('userToken', `Bearer ${response.data.token}`);
      localStorage.setItem('adminId', response.data.admin_id.toString());
      localStorage.setItem('adminName', response.data.name);
      localStorage.setItem('adminEmail', response.data.email);
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error);
    throw error;
  }
};


// Fetch User Profile API
export const addProfile = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`, // Pass token for authentication
    },
  });
  return response.data; // Expected response: { name, email }
};

// ------------------- Clients API -------------------

export const getClients = async () => {
  console.log('Fetching clients...');
  try {
    const response = await axios.get(`${API_URL}/clients`);
    console.log('Clients response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching clients:', error.response?.data || error.message);
    throw error;
  }
};

export const addClient = async (data) => {
  console.log('Sending client data:', data);
  try {
    const response = await axios.post(`${API_URL}/clients`, data);
    console.log('Response from server:', response.data);
    return response;
  } catch (error) {
    console.error('Error adding client:', error.response?.data || error.message);
    throw error;
  }
};

export const updateClient = async (clientId, data) => {
  console.log('Updating client:', clientId, data);
  try {
    const response = await axios.put(`${API_URL}/clients/${clientId}`, data);
    console.log('Update response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating client:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteClient = async (clientId) => {
  console.log('Deleting client:', clientId);
  try {
    const response = await axios.delete(`${API_URL}/clients/${clientId}`);
    console.log('Delete response:', response.data);
    return response;
  } catch (error) {
    console.error('Error deleting client:', error.response?.data || error.message);
    throw error;
  }
};

// ------------------- Cases API -------------------

export const getCases = async () => {
  console.log('Fetching cases...');
  try {
    const response = await axios.get(`${API_URL}/cases`);
    console.log('Cases response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching cases:', error.response?.data || error.message);
    throw error;
  }
};

export const addCase = async (data) => {
  console.log('Sending case data:', data);
  try {
    const response = await axios.post(`${API_URL}/cases`, data);
    console.log('Response from server:', response.data);
    return response;
  } catch (error) {
    console.error('Error adding case:', error.response?.data || error.message);
    throw error;
  }
};

export const updateCase = async (caseId, data) => {
  console.log('Updating case:', caseId, data);
  try {
    const response = await axios.put(`${API_URL}/cases/${caseId}`, data);
    console.log('Update response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating case:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteCase = async (caseId) => {
  console.log('Deleting case:', caseId);
  try {
    const response = await axios.delete(`${API_URL}/cases/${caseId}`);
    console.log('Delete response:', response.data);
    return response;
  } catch (error) {
    console.error('Error deleting case:', error.response?.data || error.message);
    throw error;
  }
};

// ------------------- Appointments API -------------------

export const getAppointments = async () => {
  console.log('Fetching appointments...');
  try {
    const response = await axios.get(`${API_URL}/appointments`);
    console.log('Appointments response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching appointments:', error.response?.data || error.message);
    throw error;
  }
};

export const addAppointment = async (data) => {
  console.log('Sending appointment data:', data);
  try {
    const response = await axios.post(`${API_URL}/appointments`, data);
    console.log('Response from server:', response.data);
    return response;
  } catch (error) {
    console.error('Error adding appointment:', error.response?.data || error.message);
    throw error;
  }
};

export const updateAppointment = async (appointmentId, data) => {
  console.log('Updating appointment:', appointmentId, data);
  try {
    const response = await axios.put(`${API_URL}/appointments/${appointmentId}`, data);
    console.log('Update response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating appointment:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId) => {
  console.log('Deleting appointment:', appointmentId);
  try {
    const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`);
    console.log('Delete response:', response.data);
    return response;
  } catch (error) {
    console.error('Error deleting appointment:', error.response?.data || error.message);
    throw error;
  }
};

// ------------------- Dashboard API -------------------

export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// ------------------- Profile API -------------------

const checkAndRefreshToken = async () => {
  const token = localStorage.getItem('userToken');
  if (!token) return false;

  try {
    await axios.get(`${API_URL}/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export const getProfile = async (adminId) => {
  try {
    const isTokenValid = await checkAndRefreshToken();
    if (!isTokenValid) {
      throw new Error('Invalid or expired token');
    }
    if (!adminId) {
      throw new Error('Admin ID is required');
    }
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/profile/${adminId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (adminId, data) => {
  try {
    if (!adminId) {
      throw new Error('Admin ID is required');
    }
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put(`${API_URL}/profile/${adminId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.response?.status === 422) {
      throw new Error('Invalid authentication token');
    }
    throw error;
  }
};

// ------------------- Lawyers API -------------------

export const getLawyers = () => axios.get(`${API_URL}/lawyers`); // Get all lawyers
export const addLawyer = async (data) => {
  console.log('Sending lawyer data:', data);
  try {
    const response = await axios.post(`${API_URL}/lawyers`, data);
    console.log('Response from server:', response.data);
    return response;
  } catch (error) {
    console.error('Error adding lawyer:', error.response?.data || error.message);
    throw error;
  }
};
export const updateLawyer = (lawyerId, data) =>
  axios.put(`${API_URL}/lawyers/${lawyerId}`, data); // Update lawyer details
export const deleteLawyer = (lawyerId) =>
  axios.delete(`${API_URL}/lawyers/${lawyerId}`); // Delete lawyer by ID



  