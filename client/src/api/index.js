import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh access token on 401
let refreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (refreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, config: original });
        });
      }

      refreshing = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);

        refreshQueue.forEach(({ resolve, config }) => {
          config.headers.Authorization = `Bearer ${data.accessToken}`;
          resolve(api(config));
        });
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        refreshQueue.forEach(({ reject }) => reject(error));
        refreshQueue = [];
        localStorage.clear();
        window.location.href = '/admin/login';
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── API functions ────────────────────────────────────────────────────────────
export const resultApi = {
  get: (roll, exam) => api.get('/result', { params: { roll, exam } }),
};

export const examApi = {
  list:      (params) => api.get('/exams', { params }),
  get:       (id)     => api.get(`/exams/${id}`),
  create:    (data)   => api.post('/exams', data),
  publish:   (id)     => api.put(`/exams/${id}/publish`),
  unpublish: (id)     => api.put(`/exams/${id}/unpublish`),
  delete:    (id)     => api.delete(`/exams/${id}`),
};

export const studentApi = {
  list:       (params) => api.get('/students', { params }),
  get:        (id)     => api.get(`/students/${id}`),
  create:     (data)   => api.post('/students', data),
  update:     (id, d)  => api.put(`/students/${id}`, d),
  delete:     (id)     => api.delete(`/students/${id}`),
  bulkImport: (file)   => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/students/bulk', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const resultAdminApi = {
  byExam: (examId, params) => api.get(`/results/exam/${examId}`, { params }),
  upload: (examId, file, onProgress) => {
    const fd = new FormData();
    fd.append('examId', examId);
    fd.append('file', file);
    return api.post('/results/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },
};

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: (refreshToken)   => api.post('/auth/logout', { refreshToken }),
};
