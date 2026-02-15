import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaMoon, FaSun, FaClock, FaBell, FaUserNurse, FaSave, FaCheck } from 'react-icons/fa';
import './Profile.css';

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
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-icon-wrapper">
                    <FaUser className="icon" />
                </div>
                <div className="profile-title">
                    <h2>Profile Settings</h2>
                    <p>Manage your account preferences</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                {/* Basic Info */}
                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon-wrapper user-icon">
                            <FaUser className="icon" />
                        </div>
                        <h3 className="card-title">Basic Information</h3>
                    </div>

                    <div className="form-fields">
                        <div className="form-group">
                            <label className="form-label">
                                Username
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your username"
                                />
                                <span className="input-icon">
                                    <FaUser className="icon" />
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter your email"
                                />
                                <span className="input-icon">
                                    <FaEnvelope className="icon" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Settings */}
                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon-wrapper settings-icon">
                            <FaSun className="icon" />
                        </div>
                        <h3 className="card-title">App Settings</h3>
                    </div>

                    <div className="form-fields">
                        {/* Theme Toggle */}
                        <div className="appearance-section">
                            <label className="appearance-label">
                                Appearance
                            </label>
                            <div className="theme-grid">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'theme', value: 'light' } });
                                        setSaved(false);
                                    }}
                                    className={`theme-button ${formData.theme === 'light' ? 'active' : ''}`}
                                >
                                    <FaSun className="icon" />
                                    <span>Light</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'theme', value: 'dark' } });
                                        setSaved(false);
                                    }}
                                    className={`theme-button ${formData.theme === 'dark' ? 'active' : ''}`}
                                >
                                    <FaMoon className="icon" />
                                    <span>Dark</span>
                                </button>
                            </div>
                        </div>

                        {/* Timezone */}
                        <div className="form-group">
                            <label className="form-label">
                                Timezone
                            </label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {timezones.map(tz => (
                                    <option key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sleep Mode */}
                        <div className="sleep-mode-section">
                            <div className="sleep-mode-header">
                                <div className="sleep-mode-label">
                                    <FaClock className="icon" />
                                    <label>
                                        Sleep Mode
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'sleepMode.enabled', type: 'checkbox', checked: !formData.sleepMode.enabled } });
                                        setSaved(false);
                                    }}
                                    className={`toggle-switch ${formData.sleepMode.enabled ? 'on' : 'off'}`}
                                >
                                    <span
                                        className="toggle-thumb"
                                    />
                                </button>
                            </div>

                            {formData.sleepMode.enabled && (
                                <div className="sleep-mode-times">
                                    <div className="time-input-group">
                                        <label className="time-input-label">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            name="sleepMode.start"
                                            value={formData.sleepMode.start}
                                            onChange={handleChange}
                                            className="time-input"
                                        />
                                    </div>
                                    <div className="time-input-group">
                                        <label className="time-input-label">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            name="sleepMode.end"
                                            value={formData.sleepMode.end}
                                            onChange={handleChange}
                                            className="time-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Caregiver Info */}
                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon-wrapper caregiver-icon">
                            <FaUserNurse className="icon" />
                        </div>
                        <h3 className="card-title">Caregiver Information</h3>
                    </div>

                    <div className="form-fields">
                        <div className="form-group">
                            <label className="form-label">
                                Caregiver Name
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="caregiver.name"
                                    value={formData.caregiver.name}
                                    onChange={handleChange}
                                    placeholder="Enter caregiver name"
                                    className="form-input"
                                />
                                <span className="input-icon">
                                    <FaUserNurse className="icon" />
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Contact Method
                            </label>
                            <select
                                name="caregiver.contactMethod"
                                value={formData.caregiver.contactMethod}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {formData.caregiver.contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={formData.caregiver.contactMethod === 'email' ? 'email' : 'tel'}
                                    name="caregiver.contactValue"
                                    value={formData.caregiver.contactValue}
                                    onChange={handleChange}
                                    placeholder={formData.caregiver.contactMethod === 'email' ? 'email@example.com' : '+91 9876543210'}
                                    className="form-input"
                                />
                                <span className="input-icon">
                                    <FaBell className="icon" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={loading || saved}
                    className={`save-button ${saved ? 'saved' : 'saving'}`}
                >
                    {loading ? (
                        <>
                            <div className="spinner" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <FaCheck className="icon" />
                            Saved Successfully
                        </>
                    ) : (
                        <>
                            <FaSave className="icon" />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Profile;
