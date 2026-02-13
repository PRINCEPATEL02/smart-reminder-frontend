import axios from 'axios';

// Use production URL for production builds, localhost for development
const getBaseURL = () => {
    if (import.meta.env.PROD) {
        return 'https://smart-reminder-backend-cg3w.onrender.com/api';
    }
    return '/api'; // Proxy in vite config handles localhost:5001
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Add a request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('smartReminderUser'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
