import axios from 'axios';

// Configure your backend URL here
// For LOCAL development with LOCAL backend: use 'http://localhost:5001'
// For LOCAL development with RENDER backend: use 'https://smart-reminder-backend-cg3w.onrender.com'
// For PRODUCTION: automatically uses the deployed URL from VITE_API_URL env variable

const getBaseURL = () => {
    // Check for environment variable first (works in both dev and production)
    // IMPORTANT: Include /api at the end of the URL
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Remove trailing slash and add /api
        return envUrl.replace(/\/$/, '') + '/api';
    }

    // Check if we're in production (deployed)
    const isProduction = window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

    if (isProduction) {
        // In production, assume backend is at same domain
        return '/api';
    }

    // For local development - Default to Render backend with /api
    return 'https://smart-reminder-backend-cg3w.onrender.com/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    // Allow credentials for cross-origin requests
    withCredentials: true,
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
