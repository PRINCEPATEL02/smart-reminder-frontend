import axios from 'axios';

// Use Render backend URL directly - no localhost
// Includes /api since backend routes are under /api/*
const api = axios.create({
    baseURL: "https://smart-reminder-backend-cg3w.onrender.com/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Add token to requests
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
