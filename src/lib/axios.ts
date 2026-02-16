// src/lib/axios.ts
import { authService } from "@/api/auth";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Detecta 401 e redireciona
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      authService.removeToken();
      
      window.location.href = "/login";
      
      return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
    }
    
    return Promise.reject(error);
  }
);

export default api;