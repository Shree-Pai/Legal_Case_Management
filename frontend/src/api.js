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
    const response = await axios.post("http://localhost:5000/admin/login", data); // Replace with actual API endpoint
    const { token } = response.data;

    // Store the token in localStorage
    localStorage.setItem("userToken", token);

    return response.data; // Return additional data if needed (e.g., user info)
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Propagate error to handle it in the UI
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

export const getClients = () => axios.get(`${API_URL}/clients`);
export const addClient = (data) => axios.post(`${API_URL}/clients`, data);
export const updateClient = (clientId, data) =>
  axios.put(`${API_URL}/clients/${clientId}`, data);
export const deleteClient = (clientId) =>
  axios.delete(`${API_URL}/clients/${clientId}`);

// ------------------- Cases API -------------------

export const getCases = () => axios.get(`${API_URL}/cases`);
export const addCase = (data) => axios.post(`${API_URL}/cases`, data);
export const updateCase = (caseId, data) =>
  axios.put(`${API_URL}/cases/${caseId}`, data);
export const deleteCase = (caseId) =>
  axios.delete(`${API_URL}/cases?case_id=${caseId}`);

// ------------------- Appointments API -------------------

export const getAppointments = () => axios.get(`${API_URL}/appointments`);
export const addAppointment = (data) => axios.post(`${API_URL}/appointments`, data);
export const updateAppointment = (appointmentId, data) =>
  axios.put(`${API_URL}/appointments/${appointmentId}`, data);
export const deleteAppointment = (appointmentId) =>
  axios.delete(`${API_URL}/appointments/${appointmentId}`);

// ------------------- Dashboard API -------------------

export const getDashboardData = async () => {
  // Mock data for dashboard stats
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total_clients: 50,
        total_cases: 100,
        important_cases: 10,
        archived_cases: 5,
      });
    }, 1000); // Simulate 1-second delay
  });
};

// ------------------- Profile API -------------------

export const editProfile = (profileId, data) =>
  axios.put(`${API_URL}/profile/${profileId}`, data);

// ------------------- Lawyers API -------------------

export const getLawyers = () => axios.get(`${API_URL}/lawyers`); // Get all lawyers
export const addLawyer = (data) => axios.post(`${API_URL}/lawyers`, data); // Add new lawyer
export const updateLawyer = (lawyerId, data) =>
  axios.put(`${API_URL}/lawyers/${lawyerId}`, data); // Update lawyer details
export const deleteLawyer = (lawyerId) =>
  axios.delete(`${API_URL}/lawyers/${lawyerId}`); // Delete lawyer by ID



  