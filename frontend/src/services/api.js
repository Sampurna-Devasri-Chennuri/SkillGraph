import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

export const skillsAPI = {
  getCategories: () => api.get('/categories/'),
  getSkills: (params) => api.get('/skills/', { params }),
  getSkillDetail: (slugOrId) => api.get(`/skills/${slugOrId}/`),
  getUserSkills: () => api.get('/user-skills/'),
  addUserSkill: (data) => api.post('/user-skills/', data),
  updateUserSkill: (id, data) => api.patch(`/user-skills/${id}/`, data),
  deleteUserSkill: (id) => api.delete(`/user-skills/${id}/`),
};

export const careersAPI = {
  getCareers: (params) => api.get('/careers/', { params }),
  getCareerDetail: (slugOrId) => api.get(`/careers/${slugOrId}/`),
  simulateTransition: (sourceId, targetId) =>
    api.post('/simulator/compare/', {
      source_career_id: sourceId,
      target_career_id: targetId,
    }),
};

export const graphAPI = {
  getGraph: (params) => api.get('/graph/', { params }),
  getGapAnalysis: (params) => api.get('/gap-analysis/', { params }),
};

export const learningPathsAPI = {
  getLearningPaths: () => api.get('/learning-paths/'),
  getLearningPathDetail: (id) => api.get(`/learning-paths/${id}/`),
  generateLearningPath: (data) => api.post('/learning-paths/generate/', data),
  updateStepStatus: (stepId, status) =>
    api.patch(`/learning-paths/steps/${stepId}/status/`, { status }),
};

export const projectsAPI = {
  getProjects: () => api.get('/projects/'),
  createProject: (data) => api.post('/projects/', data),
  updateProject: (id, data) => api.put(`/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
  extractSkills: (id) => api.post(`/projects/${id}/extract-skills/`),
};

export const analyticsAPI = {
  getDashboardMetrics: () => api.get('/analytics/dashboard/'),
};

export default api;
