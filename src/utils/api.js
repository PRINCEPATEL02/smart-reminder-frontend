import axios from 'axios';

// Use VITE_API_URL environment variable - always points to Render backend
// No localhost, no fallback - forces production URL only
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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
