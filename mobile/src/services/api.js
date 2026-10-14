import axios from 'axios';
import storage from '../utils/storage';
import { getBaseUrl } from '../config/apiConfig';

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to set dynamic baseURL and JWT token
api.interceptors.request.use(
  async (config) => {
    config.baseURL = getBaseUrl();
    try {
      const token = await storage.getItem('@careertwin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignored
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Network request failed. Please check backend connection.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
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
  updateGoal: (data) => api.put('/career-goal', data),
  getRoleSkills: (role) => api.get('/career-goal/role-skills', { params: { role } }),
};

export const careerTwinApi = {
  getCareerTwin: () => api.get('/career-twin'),
  recalculate: () => api.post('/career-twin/recalculate'),
};

export const resumeApi = {
  uploadResume: (formData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: () => api.get('/resumes'),
  getLatest: () => api.get('/resumes/latest'),
  getById: (id) => api.get(`/resumes/${id}`),
};

export const atsApi = {
  analyze: (resumeId) =>
    api.post(resumeId ? `/ats/analyze?resumeId=${resumeId}` : '/ats/analyze'),
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
  getQuestions: (category = 'ALL') =>
    api.get('/assessment/questions', { params: { category } }),
  submitAssessment: (data) => api.post('/assessment/submit', data),
  getResults: () => api.get('/assessment/results'),
  getLatest: () => api.get('/assessment/latest'),
  getCodingChallenges: (category) =>
    api.get('/assessment/coding-challenges', { params: category ? { category } : {} }),
  runCoding: (data) => api.post('/assessment/coding-run', data),
  submitCoding: (data) => api.post('/assessment/coding-submit', data),
};

export const skillGapApi = {
  getSkillGaps: () => api.get('/skill-gaps'),
};

export const roadmapApi = {
  getRoadmap: () => api.get('/roadmap'),
  togglePhase: (phaseId) => api.post(`/roadmap/phases/${phaseId}/toggle`),
  getRecommendedProjects: () => api.get('/roadmap/projects'),
  updateProjectStatus: (projectId, status) => api.patch(`/roadmap/projects/${projectId}/status`, { status }),
  regenerateProjects: () => api.post('/roadmap/projects/regenerate'),
};

export const challengeApi = {
  getChallenges: () => api.get('/challenges'),
  toggleChallenge: (challengeId) => api.post(`/challenges/${challengeId}/toggle`),
};

export const progressApi = {
  getProgress: () => api.get('/progress'),
};

export const reportApi = {
  getReport: () => api.get('/reports'),
};

export const aiApi = {
  getGuidance: (data) => api.post('/ai/guidance', data),
};

export default api;
