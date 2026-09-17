// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "https://apijeevan.vercel.app",//"https://jeevan-backend.vercel.app/",//https://apijeevan.vercel.app/",//"https://jeevan-backend-n9hy.onrender.com", "https://apijeevan.vercel.app/"  //http://localhost:5000", // Your backend UR LbaseURL: "https://tithe-backend.onrender.com"
//   withCredentials: true, // Include cookies in requests
// });
 
// export default axiosInstance;

// src/axiosConfig.js
import axios from 'axios';
import { getAuthToken } from './utils/auth';
const baseURL = process.env.REACT_APP_API_URL || 'https://curia-backend.vercel.app';// 'http://localhost:5000';//'http://jeevankply.com:5000';//http://jeevankply.com:5000';'https://curia-backend.vercel.app';//
const axiosInstance = axios.create({
  baseURL: baseURL,//'https://jeevan-backend.vercel.app',  //'https://jeevan-backend.vercel.app','http://localhost:5000',''http://192.168.1.11:5000';
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
