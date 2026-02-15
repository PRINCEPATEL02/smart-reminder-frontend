import axios from 'axios';

// Use Render backend URL directly - no localhost, no withCredentials
// Backend routes are under /api/*, so we include /api in baseURL
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
