const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'civicshield_token';
const USER_KEY = 'civicshield_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Also clean up legacy demo keys
  localStorage.removeItem('crimeconnect-session');
  localStorage.removeItem('crimeconnect_current_user');
  localStorage.removeItem('crimeconnect_users');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
}

/**
 * Core fetch wrapper with auth header injection and standardized error parsing
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = { ...options.headers };
  const token = getToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Session expired or invalid
        clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }

      const errorMessage = data?.message || data?.errors 
        ? (typeof data.errors === 'object' ? Object.values(data.errors).flat().join(', ') : data.message)
        : `Request failed with status ${response.status}`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const connError = new Error('Unable to connect to Civic Shield API server. Please ensure the backend is running.');
      connError.status = 503;
      throw connError;
    }
    throw error;
  }
}

// HTTP verbs
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// ─── Module-specific API services ────────────────

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const citizenApi = {
  getDashboard: () => api.get('/citizen/dashboard'),
  submitReport: (reportData) => api.post('/citizen/reports', reportData),
  getMyReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/citizen/reports${query ? `?${query}` : ''}`);
  },
  getReportDetails: (id) => api.get(`/citizen/reports/${id}`),
  getReportTimeline: (id) => api.get(`/citizen/reports/${id}/timeline`),
  getNotifications: () => api.get('/citizen/notifications'),
  readNotification: (id) => api.patch(`/citizen/notifications/${id}/read`),
  getProfile: () => api.get('/citizen/profile'),
  updateProfile: (profileData) => api.patch('/citizen/profile', profileData),
};

export const policeApi = {
  getDashboard: () => api.get('/police/dashboard'),
  getNewReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/police/reports/new${query ? `?${query}` : ''}`);
  },
  getAssignedCases: () => api.get('/police/cases'),
  getCaseDetails: (id) => api.get(`/police/cases/${id}`),
  getInvestigation: (id) => api.get(`/police/cases/${id}/investigation`),
  addInvestigationNote: (id, note) => api.post(`/police/cases/${id}/investigation`, { note }),
  updateStatus: (id, status, remarks) => api.patch(`/police/cases/${id}/status`, { status, remarks }),
  exportReports: () => api.get('/police/reports'),
  getProfile: () => api.get('/police/profile'),
  updateProfile: (profileData) => api.patch('/police/profile', profileData),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/users${query ? `?${query}` : ''}`);
  },
  createUser: (userData) => api.post('/admin/users', userData),
  getOfficers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/officers${query ? `?${query}` : ''}`);
  },
  getAllReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports${query ? `?${query}` : ''}`);
  },
  getUnassignedCases: () => api.get('/admin/cases/unassigned'),
  assignCase: (caseId, officerId) => api.post(`/admin/cases/${caseId}/assign`, { officerId }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (profileData) => api.patch('/admin/profile', profileData),
};

export const evidenceApi = {
  getCaseEvidence: (caseId) => api.get(`/evidence/cases/${caseId}`),
  uploadEvidence: (caseId, files, description = '') => {
    const formData = new FormData();
    if (Array.isArray(files) || files instanceof FileList) {
      Array.from(files).forEach((file) => formData.append('files', file));
    } else if (files instanceof File) {
      formData.append('files', files);
    }
    if (description) {
      formData.append('description', description);
    }
    return api.post(`/evidence/cases/${caseId}`, formData);
  },
  getEvidenceDetails: (id) => api.get(`/evidence/${id}`),
  deleteEvidence: (id) => api.delete(`/evidence/${id}`),
};
