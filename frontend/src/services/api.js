import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors and auto-logout on 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if trying to login
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getDemoCredentials: () => api.get('/auth/demo-credentials'),
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.post('/profile/change-password', data),
};

export const careerGoalApi = {
  getGoal: () => api.get('/career-goal'),
  saveGoal: (data) => api.post('/career-goal', data),
  getRoleSkills: (role) => api.get(`/career-goal/role-skills?role=${encodeURIComponent(role)}`),
};

export const resumeApi = {
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/resumes'),
  getLatest: () => api.get('/resumes/latest'),
  getById: (id) => api.get(`/resumes/${id}`),
  downloadResume: async (id, fileName) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/resumes/${id}/download`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || `resume_v${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
  getDownloadUrl: (id) => {
    const token = localStorage.getItem('token');
    return `/api/resumes/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};

export const atsApi = {
  analyze: (resumeId) => api.post(resumeId ? `/ats/analyze?resumeId=${resumeId}` : '/ats/analyze'),
  getLatest: () => api.get('/ats/latest'),
  getByResumeId: (resumeId) => api.get(`/ats/resume/${resumeId}`),
};

export const codingProfileApi = {
  getProfiles: () => api.get('/coding-profile'),
  saveProfile: (data) => api.post('/coding-profile', data),
  syncProfile: (platform) => api.post(`/coding-profile/${platform}/sync`),
  deleteProfile: (id) => api.delete(`/coding-profile/${id}`),
};

export const assessmentApi = {
  getQuestions: (category = 'ALL') => api.get(`/assessment/questions?category=${category}`),
  submitAssessment: (data) => api.post('/assessment/submit', data),
  getResults: () => api.get('/assessment/results'),
  getLatest: () => api.get('/assessment/latest'),
  getCodingChallenges: (category) => api.get(`/assessment/coding-challenges${category ? `?category=${category}` : ''}`),
  runCoding: (data) => api.post('/assessment/coding-run', data),
  submitCoding: (data) => api.post('/assessment/coding-submit', data),
};

export const careerTwinApi = {
  getCareerTwin: () => api.get('/career-twin'),
  recalculate: () => api.post('/career-twin/recalculate'),
};

export const skillGapApi = {
  getSkillGaps: () => api.get('/skill-gaps'),
};

export const roadmapApi = {
  getRoadmap: () => api.get('/roadmap'),
  togglePhase: (phaseId) => api.post(`/roadmap/phases/${phaseId}/toggle`),
  getProjects: () => api.get('/roadmap/projects'),
  updateProjectStatus: (projectId, status) => api.patch(`/roadmap/projects/${projectId}/status`, { status }),
  regenerateProjects: () => api.post('/roadmap/projects/regenerate'),
};

export const challengeApi = {
  getChallenges: () => api.get('/challenges'),
  toggleChallenge: (id) => api.post(`/challenges/${id}/toggle`),
};

export const progressApi = {
  getProgress: () => api.get('/progress'),
};

export const aiGuidanceApi = {
  getGuidance: (data) => api.post('/ai/guidance', data),
};

export const reportsApi = {
  getReport: () => api.get('/reports'),
};

export default api;
