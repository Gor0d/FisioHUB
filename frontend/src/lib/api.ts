import axios from 'axios';
import { LoginInput, RegisterInput, ApiResponse, User } from '@fisiohub/shared';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fisiohub-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fisiohub-token');
      localStorage.removeItem('fisiohub-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginInput): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export { api };