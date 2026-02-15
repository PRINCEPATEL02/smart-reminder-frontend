import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Apply theme to document
const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile with settings
    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');

            // Get existing token from localStorage or current user
            const existingToken = user?.token || JSON.parse(localStorage.getItem('smartReminderUser') || '{}').token;

            const updatedUser = {
                ...(user || {}),
                ...data,
                token: existingToken || data.token, // Preserve existing token
            };
            setUser(updatedUser);
            localStorage.setItem('smartReminderUser', JSON.stringify(updatedUser));
            // Apply theme
            if (data.settings?.theme) {
                applyTheme(data.settings.theme);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Try to get user from localStorage
                const storedUser = localStorage.getItem('smartReminderUser');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // Apply stored theme
                    if (parsedUser.settings?.theme) {
                        applyTheme(parsedUser.settings.theme);
                    }
                    // Fetch fresh profile with settings
                    await fetchUserProfile();
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login to:', api.defaults.baseURL);
            const { data } = await api.post('/auth/login', { email, password });

            // Store user data securely
            const userData = {
                _id: data._id,
                username: data.username,
                email: data.email,
                token: data.token,
            };

            setUser(userData);
            localStorage.setItem('smartReminderUser', JSON.stringify(userData));

            // Fetch profile to get settings and apply theme
            await fetchUserProfile();

            toast.success('Logged in successfully');
            return true;
        } catch (error) {
            // Log full error details for debugging
            console.error('=== LOGIN ERROR DEBUG ===');
            console.error('Error message:', error.message);
            console.error('Error response status:', error.response?.status);
            console.error('Error response data:', error.response?.data);
            console.error('Error config:', error.config);
            console.error('=========================');

            const message = error.response?.data?.message || error.message || 'Login failed';
            toast.error(message);
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { username, email, password });

            // Store user data securely
            const userData = {
                _id: data._id,
                username: data.username,
                email: data.email,
                token: data.token,
            };

            setUser(userData);
            localStorage.setItem('smartReminderUser', JSON.stringify(userData));

            toast.success('Account created successfully');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('smartReminderUser');
        // Reset to light theme
        applyTheme('light');
        toast.info('Logged out');
    };

    const updateUser = async (userData) => {
        try {
            const { data } = await api.put('/auth/profile', userData);

            // Get existing token from localStorage or current user
            const existingToken = user?.token || JSON.parse(localStorage.getItem('smartReminderUser') || '{}').token;

            const updatedUser = {
                ...(user || {}),
                ...data,
                token: existingToken || data.token, // Preserve existing token
            };

            setUser(updatedUser);
            localStorage.setItem('smartReminderUser', JSON.stringify(updatedUser));

            // Apply theme if it was changed
            if (data.settings?.theme) {
                applyTheme(data.settings.theme);
            }

            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            throw new Error(message);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
