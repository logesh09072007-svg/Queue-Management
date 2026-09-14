/**
 * QueueSense AI - API Service Layer
 */

const API_BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('queuesense_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.access_token) {
      localStorage.setItem('queuesense_token', data.access_token);
      localStorage.setItem('queuesense_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (name, email, password, role = 'student') => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  logout: () => {
    localStorage.removeItem('queuesense_token');
    localStorage.removeItem('queuesense_user');
  },

  // Queue Endpoints
  getCurrentQueue: async () => {
    const res = await fetch(`${API_BASE_URL}/queue/current`);
    return handleResponse(res);
  },

  updateQueue: async (data) => {
    const res = await fetch(`${API_BASE_URL}/queue/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getQueueHistory: async (skip = 0, limit = 50) => {
    const res = await fetch(`${API_BASE_URL}/queue/history?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  deleteQueueRecord: async (recordId) => {
    const res = await fetch(`${API_BASE_URL}/queue/${recordId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Predictions
  getTodayPredictions: async (dayOffset = 0) => {
    const res = await fetch(`${API_BASE_URL}/predictions/today?day_offset=${dayOffset}`);
    return handleResponse(res);
  },

  getUpcomingPredictions: async (maxSlots = 6) => {
    const res = await fetch(`${API_BASE_URL}/predictions/upcoming?max_slots=${maxSlots}`);
    return handleResponse(res);
  },

  getRecommendedTime: async () => {
    const res = await fetch(`${API_BASE_URL}/predictions/recommended`);
    return handleResponse(res);
  },

  predictCustom: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/predictions/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Feedback
  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedbackData),
    });
    return handleResponse(res);
  },

  getFeedbackList: async (limit = 50) => {
    const res = await fetch(`${API_BASE_URL}/feedback?limit=${limit}`);
    return handleResponse(res);
  },

  // Analytics
  getAnalyticsDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`);
    return handleResponse(res);
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(res);
  },

  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse(res);
  },
};
