import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const REMINDER_TYPES = [
    { value: 'Habit', label: 'Habit', icon: '✨', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'Medicine', label: 'Medicine', icon: '💊', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'Meeting', label: 'Meeting', icon: '📅', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'Work', label: 'Work', icon: '💼', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'Water', label: 'Water', icon: '💧', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { value: 'Custom', label: 'Custom', icon: '📌', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const SCHEDULE_TYPES = [
    { value: 'Daily', label: 'Every Day', icon: '🔄' },
    { value: 'SelectedDays', label: 'Specific Days', icon: '📅' },
    { value: 'Random', label: 'Random Days', icon: '🎲' },
];

const WEEKDAYS = [
    { value: 0, label: 'Sun', short: 'S' },
    { value: 1, label: 'Mon', short: 'M' },
    { value: 2, label: 'Tue', short: 'T' },
    { value: 3, label: 'Wed', short: 'W' },
    { value: 4, label: 'Thu', short: 'T' },
    { value: 5, label: 'Fri', short: 'F' },
    { value: 6, label: 'Sat', short: 'S' },
];

const NOTIFICATION_TYPES = [
    { value: 'Push', label: 'Push', icon: '🔔', desc: 'Notification only' },
    { value: 'Sound', label: 'Sound', icon: '🔊', desc: 'Alarm sound only' },
    { value: 'Both', label: 'Both', icon: '📳', desc: 'Notification + Sound' },
];

const AddTask = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        type: 'Habit',
        description: '',
        priority: 'Medium',
        notificationType: 'Push',
        scheduleType: 'Daily',
        selectedDays: [1, 2, 3, 4, 5],
        randomDays: 3,
        times: ['08:00'],
        medicineDetails: { dosage: '', instructions: 'Before Food', stock: 0 },
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [showMedicineDetails, setShowMedicineDetails] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const fetchTask = async () => {
                try {
                    const { data } = await api.get('/tasks');
                    const task = data.find(t => t._id === id);
                    if (task) {
                        setFormData({
                            title: task.title || '',
                            type: task.type || 'Habit',
                            description: task.description || '',
                            priority: task.priority || 'Medium',
                            notificationType: task.notificationType || 'Push',
                            scheduleType: task.scheduleType || 'Daily',
                            selectedDays: task.selectedDays || [1, 2, 3, 4, 5],
                            randomDays: task.randomDays || 3,
                            times: task.times || ['08:00'],
                            medicineDetails: task.medicineDetails || { dosage: '', instructions: 'Before Food', stock: 0 },
                            isActive: task.isActive !== false,
                        });
                        setShowMedicineDetails(task.type === 'Medicine');
                    }
                } catch (error) {
                    toast.error('Failed to load task');
                }
            };
            fetchTask();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('med_')) {
            const medField = name.split('_')[1];
            setFormData({
                ...formData,
                medicineDetails: {
                    ...formData.medicineDetails,
                    [medField]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }

        if (name === 'type') {
            setShowMedicineDetails(value === 'Medicine');
        }
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData({ ...formData, times: newTimes });
    };

    const addTimeSlot = () => {
        setFormData({ ...formData, times: [...formData.times, '09:00'] });
    };

    const removeTimeSlot = (index) => {
        const newTimes = formData.times.filter((_, i) => i !== index);
        setFormData({ ...formData, times: newTimes });
    };

    const toggleDay = (day) => {
        const days = formData.selectedDays.includes(day)
            ? formData.selectedDays.filter(d => d !== day)
            : [...formData.selectedDays, day];
        setFormData({ ...formData, selectedDays: days });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a reminder name');
            return;
        }

        if (formData.times.length === 0) {
            toast.error('Please add at least one notification time');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                type: formData.type,
                description: formData.description,
                priority: formData.priority,
                notificationType: formData.notificationType,
                times: formData.times,
                medicineDetails: formData.type === 'Medicine' ? formData.medicineDetails : undefined,
                schedule: {
                    type: formData.scheduleType,
                    days: formData.scheduleType === 'SelectedDays' ? formData.selectedDays : undefined,
                    randomCount: formData.scheduleType === 'Random' ? formData.randomDays : undefined,
                },
                isActive: formData.isActive,
            };

            if (isEditMode) {
                await api.put(`/tasks/${id}`, payload);
                toast.success('Reminder updated successfully');
            } else {
                await api.post('/tasks', payload);
                toast.success('Reminder created successfully');
            }
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save reminder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link to="/" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FaArrowLeft className="text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Reminder' : 'Add New Reminder'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Reminder Name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-2 block">Reminder Name</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="What do you want to be reminded about?"
                        required
                        className="w-full"
                    />
                </motion.div>

                {/* Type Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-3 block">Reminder Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {REMINDER_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                    handleChange({ target: { name: 'type', value: type.value } });
                                }}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${formData.type === type.value
                                    ? `${type.color} border-current`
                                    : 'bg-gray-50 border-transparent hover:border-gray-200'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{type.icon}</div>
                                <div className="text-xs font-medium">{type.label}</div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Description (Optional) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-2 block">Description (Optional)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add some details..."
                        rows={3}
                        className="w-full resize-none"
                    />
                </motion.div>

                {/* Schedule Type */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-3 block">Schedule</label>
                    <div className="space-y-2">
                        {SCHEDULE_TYPES.map((schedule) => (
                            <label
                                key={schedule.value}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.scheduleType === schedule.value
                                    ? 'border-blue-800 bg-blue-800 dark:bg-white'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="scheduleType"
                                    value={schedule.value}
                                    checked={formData.scheduleType === schedule.value}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className="text-xl">{schedule.icon}</span>
                                <span className={`font-medium text-primary-500`}>{schedule.label}</span>
                                {formData.scheduleType === schedule.value && (
                                    <span className="ml-auto text-primary-500">✓</span>
                                )}
                            </label>
                        ))}
                    </div>

                    {/* Selected Days */}
                    {formData.scheduleType === 'SelectedDays' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="text-sm text-gray-600 mb-2 block">Select Days</label>
                            <div className="flex gap-2 justify-between">
                                {WEEKDAYS.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${formData.selectedDays.includes(day.value)
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {day.short}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Random Days */}
                    {formData.scheduleType === 'Random' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="text-sm text-gray-600 mb-2 block">
                                Random days per week: {formData.randomDays}
                            </label>
                            <input
                                type="range"
                                name="randomDays"
                                min="1"
                                max="7"
                                value={formData.randomDays}
                                onChange={handleChange}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1 day</span>
                                <span>7 days</span>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Notification Times */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-3 block">Notification Times</label>
                    <div className="space-y-3">
                        {formData.times.map((time, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => handleTimeChange(index, e.target.value)}
                                    className="flex-1"
                                    required
                                />
                                {formData.times.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTimeSlot(index)}
                                        className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                        <FaMinus />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addTimeSlot}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaPlus /> Add Another Time
                        </button>
                    </div>
                </motion.div>

                {/* Notification Type */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-3 block">Notification Style</label>
                    <div className="space-y-2">
                        {NOTIFICATION_TYPES.map((notif) => (
                            <label
                                key={notif.value}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.notificationType === notif.value
                                    ? 'border-blue-800 bg-blue-800 dark:bg-white'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="notificationType"
                                    value={notif.value}
                                    checked={formData.notificationType === notif.value}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className="text-xl">{notif.icon}</span>
                                <div className="flex-1">
                                    <div className={`font-medium text-primary-500`}>{notif.label}</div>
                                    <div className={`text-xs text-primary-500`}>{notif.desc}</div>
                                </div>
                                {formData.notificationType === notif.value && (
                                    <span className="text-primary-500">✓</span>
                                )}
                            </label>
                        ))}
                    </div>
                </motion.div>

                {/* Medicine Details (Conditional) */}
                {showMedicineDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card border-red-200"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">💊</span>
                            <h3 className="font-semibold text-gray-900">Medicine Details</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Dosage</label>
                                <input
                                    name="med_dosage"
                                    value={formData.medicineDetails.dosage}
                                    onChange={handleChange}
                                    placeholder="e.g., 500mg, 2 tablets"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Instructions</label>
                                <select
                                    name="med_instructions"
                                    value={formData.medicineDetails.instructions}
                                    onChange={handleChange}
                                    className="w-full"
                                >
                                    <option value="Before Food">Before Food</option>
                                    <option value="After Food">After Food</option>
                                    <option value="Anytime">Anytime</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Priority */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="card"
                >
                    <label className="font-medium text-gray-900 mb-3 block">Priority</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-primary-500/30"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            `${isEditMode ? 'Update' : 'Save'} Reminder`
                        )}
                    </button>
                </motion.div>
            </form>
        </div>
    );
};

export default AddTask;
