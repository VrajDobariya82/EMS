// Use environment variable in production, fallback to localhost for development
const API_BASE = process.env.REACT_APP_API_BASE || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

function getToken() {
  try {
    const raw = localStorage.getItem('ems.session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch (_) {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  
  // Check if response is HTML (error page) instead of JSON
  if (text && (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'))) {
    throw new Error(`Server returned HTML instead of JSON. The endpoint ${path} may not exist or the server may be down.`);
  }
  
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
    }
  }
  
  if (!res.ok) {
    throw new Error(data?.error || res.statusText || `HTTP ${res.status}`);
  }
  
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' })
};

// Reports API functions
export const reportsApi = {
  // Admin reports
  getEmployeeReport: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get(`/reports/employees${query ? '?' + query : ''}`);
  },
  
  getAttendanceReport: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    const query = params.toString();
    return api.get(`/reports/attendance${query ? '?' + query : ''}`);
  },
  
  getLeaveReport: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get(`/reports/leaves${query ? '?' + query : ''}`);
  },
  
  getPayrollReport: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    const query = params.toString();
    return api.get(`/reports/payroll${query ? '?' + query : ''}`);
  },
  
  getOverviewReport: () => api.get('/reports/overview'),
  
  // Employee reports
  getMyReports: (email, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    const query = params.toString();
    return api.get(`/reports/my/${email}${query ? '?' + query : ''}`);
  }
};

export const API_BASE_URL = API_BASE;


