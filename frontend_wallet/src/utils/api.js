import axios from 'axios';

// Create axios instance
const api = axios.create({
    // Use Vite proxy so browser stays on one port (frontend port).
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false // Disable credentials to avoid CORS issues
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url, config.data || '');
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response?.status, error.config?.url, error.response?.data);
        
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Show user-friendly message
            if (window.location.pathname !== '/login') {
                alert('Your session has expired. Please login again.');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
