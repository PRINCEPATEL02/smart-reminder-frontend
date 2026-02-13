import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaMoon, FaSun, FaClock, FaBell, FaUserNurse, FaSave, FaCheck } from 'react-icons/fa';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        theme: 'light',
        timezone: 'UTC',
        sleepMode: {
            enabled: false,
            start: '22:00',
            end: '07:00',
        },
        caregiver: {
            name: '',
            contactMethod: 'email',
            contactValue: '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                theme: user.settings?.theme || 'light',
                timezone: user.settings?.timezone || 'UTC',
                sleepMode: user.settings?.sleepMode || {
                    enabled: false,
                    start: '22:00',
                    end: '07:00',
                },
                caregiver: user.caregiver || {
                    name: '',
                    contactMethod: 'email',
                    contactValue: '',
                },
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('sleepMode.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                sleepMode: {
                    ...prev.sleepMode,
                    [key]: type === 'checkbox' ? checked : value,
                },
            }));
        } else if (name.startsWith('caregiver.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                caregiver: {
                    ...prev.caregiver,
                    [key]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
        setSaved(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateUser(formData);
            setSaved(true);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const timezones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time (New York)' },
        { value: 'America/Chicago', label: 'Central Time (Chicago)' },
        { value: 'America/Denver', label: 'Mountain Time (Denver)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
        { value: 'Europe/London', label: 'London (UK)' },
        { value: 'Europe/Paris', label: 'Paris (France)' },
        { value: 'Europe/Berlin', label: 'Berlin (Germany)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (Japan)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (China)' },
        { value: 'Asia/Calcutta', label: 'India (Mumbai/Delhi)' },
        { value: 'Asia/Dubai', label: 'Dubai (UAE)' },
        { value: 'Australia/Sydney', label: 'Sydney (Australia)' },
        { value: 'Pacific/Auckland', label: 'Auckland (New Zealand)' },
    ];

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <FaUser className="text-white text-lg" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-sm text-gray-500">Manage your account preferences</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <FaUser className="text-primary-600 dark:text-primary-400 text-sm" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                    placeholder="Enter your username"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaUser className="text-sm" />
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                    placeholder="Enter your email"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaEnvelope className="text-sm" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FaSun className="text-indigo-600 dark:text-indigo-400 text-sm" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">App Settings</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Theme Toggle */}
                        <div>
                            <label className="block text-lg font-semibold text-white mb-2">
                                Appearance
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'theme', value: 'light' } });
                                        setSaved(false);
                                    }}
                                    className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${formData.theme === 'light'
                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <FaSun className="text-lg" />
                                    <span className="font-semibold text-lg">Light</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'theme', value: 'dark' } });
                                        setSaved(false);
                                    }}
                                    className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${formData.theme === 'dark'
                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <FaMoon className="text-lg" />
                                    <span className="font-semibold text-lg">Dark</span>
                                </button>
                            </div>
                        </div>

                        {/* Timezone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Timezone
                            </label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-all appearance-none cursor-pointer"
                            >
                                {timezones.map(tz => (
                                    <option key={tz.value} value={tz.value} className="bg-white dark:bg-gray-700">
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sleep Mode */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-gray-400" />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sleep Mode
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'sleepMode.enabled', type: 'checkbox', checked: !formData.sleepMode.enabled } });
                                        setSaved(false);
                                    }}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.sleepMode.enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.sleepMode.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {formData.sleepMode.enabled && (
                                <div className="grid grid-cols-2 gap-3 pl-9">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            name="sleepMode.start"
                                            value={formData.sleepMode.start}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            name="sleepMode.end"
                                            value={formData.sleepMode.end}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Caregiver Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FaUserNurse className="text-emerald-600 dark:text-emerald-400 text-sm" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Caregiver Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Caregiver Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="caregiver.name"
                                    value={formData.caregiver.name}
                                    onChange={handleChange}
                                    placeholder="Enter caregiver name"
                                    className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaUserNurse className="text-sm" />
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Contact Method
                            </label>
                            <select
                                name="caregiver.contactMethod"
                                value={formData.caregiver.contactMethod}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            >
                                <option value="email" className="bg-white dark:bg-gray-700">Email</option>
                                <option value="sms" className="bg-white dark:bg-gray-700">SMS</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {formData.caregiver.contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                            </label>
                            <div className="relative">
                                <input
                                    type={formData.caregiver.contactMethod === 'email' ? 'email' : 'tel'}
                                    name="caregiver.contactValue"
                                    value={formData.caregiver.contactValue}
                                    onChange={handleChange}
                                    placeholder={formData.caregiver.contactMethod === 'email' ? 'email@example.com' : '+91 9876543210'}
                                    className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaBell className="text-sm" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={loading || saved}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${saved
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <FaCheck className="text-lg" />
                            Saved Successfully
                        </>
                    ) : (
                        <>
                            <FaSave className="text-lg" />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Profile;
