import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaCheck, FaEdit, FaTrash, FaBell, FaCalendar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const getTypeColor = (type) => {
    const colors = {
        Medicine: 'chip-medicine',
        Habit: 'chip-habit',
        Meeting: 'chip-meeting',
        Custom: 'chip-custom',
        Water: 'bg-blue-100 text-blue-700',
        Work: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
};

const getTypeIcon = (type) => {
    const icons = {
        Medicine: '💊',
        Habit: '✨',
        Meeting: '📅',
        Water: '💧',
        Work: '💼',
        Custom: '📌',
    };
    return icons[type] || '🔔';
};

const Dashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    // Notifications permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    const fetchTasks = async () => {
        try {
            const tasksRes = await api.get('/tasks');
            setTasks(tasksRes.data);

            // Fetch today's completed tasks
            const completedRes = await api.get('/tasks/completed/today');
            setCompletedTasks(completedRes.data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch tasks';
            if (message.includes('buffering timed out') || message.includes('Not authorized')) {
                toast.error('Database connection error. Please check your MongoDB Atlas IP whitelist settings.');
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleComplete = async (taskId) => {
        try {
            await api.post(`/tasks/${taskId}/complete`);
            toast.success('Task completed! 🎉');
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Already completed today');
        }
    };

    const isTaskCompleted = (taskId) => {
        return completedTasks.includes(taskId) || completedTasks.some(ct => ct._id === taskId || ct === taskId);
    };

    const handleDelete = async (taskId) => {
        if (confirm('Are you sure you want to delete this reminder?')) {
            try {
                await api.delete(`/tasks/${taskId}`);
                toast.success('Reminder deleted');
                fetchTasks();
            } catch (err) {
                toast.error('Failed to delete');
            }
        }
    };

    const filterTasks = (tasks) => {
        if (filter === 'all') return tasks;
        return tasks.filter(task => task.type === filter);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const filteredTasks = filterTasks(tasks);

    return (
        <div>
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h2 className="text-2xl font-bold text-gray-900">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.username?.split(' ')[0]}! 👋
                </h2>
                <p className="text-gray-500 mt-1">
                    {format(new Date(), 'EEEE, MMMM d')}
                </p>
            </motion.div>

            {/* Today's Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm">Today's Reminders</p>
                        <p className="text-3xl font-bold mt-1">{tasks.filter(t => t.isActive).length}</p>
                        <p className="text-primary-100 text-sm mt-1">Active reminders</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <FaBell className="text-2xl" />
                    </div>
                </div>
            </motion.div>

            {/* Filter Section */}
            <div className="section-header">
                <h3 className="text-lg font-semibold">Your Reminders</h3>
                <div className="relative">
                    <button
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                        className="btn btn-secondary text-sm py-2"
                    >
                        <FaCalendar className="mr-1.5" />
                        {filter === 'all' ? 'All' : filter}
                    </button>
                    <AnimatePresence>
                        {filterMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg py-2 min-w-[140px] z-50"
                            >
                                {['all', 'Medicine', 'Habit', 'Meeting', 'Water', 'Work', 'Custom'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setFilter(type);
                                            setFilterMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filter === type ? 'text-primary-500 font-medium' : 'text-gray-700'}`}
                                    >
                                        {type === 'all' ? 'All Types' : type}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card text-center py-12"
                >
                    <div className="text-6xl mb-4">🔔</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h3>
                    <p className="text-gray-500 mb-6">Start adding reminders to stay on track!</p>
                    <Link to="/add-task" className="btn btn-primary">
                        Add Your First Reminder
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className={`card ${!task.isActive ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Type Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isTaskCompleted(task._id) ? 'bg-green-100' : getTypeColor(task.type).replace('chip-', 'bg-').replace('700', '100').split(' ')[0]}`}>
                                        {isTaskCompleted(task._id) ? '✅' : getTypeIcon(task.type)}
                                    </div>

                                    {/* Task Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className={`font-semibold truncate ${isTaskCompleted(task._id) ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h4>
                                                <span className={`chip ${getTypeColor(task.type)} mt-1`}>
                                                    {task.type}
                                                </span>
                                            </div>
                                            <span className={`badge ${task.isActive ? 'badge-success' : 'badge-warning'}`}>
                                                {task.isActive ? 'Active' : 'Paused'}
                                            </span>
                                        </div>

                                        {task.description && (
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{task.description}</p>
                                        )}

                                        {/* Times */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {task.times.slice(0, 3).map((time, idx) => (
                                                <span key={idx} className="time-chip">
                                                    {time}
                                                </span>
                                            ))}
                                            {task.times.length > 3 && (
                                                <span className="time-chip">+{task.times.length - 3}</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                            {isTaskCompleted(task._id) ? (
                                                <span className="text-green-600 font-medium flex items-center">
                                                    <FaCheck className="mr-1" />
                                                    Completed Today
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleComplete(task._id)}
                                                    className="btn-check rounded-lg px-3 py-1.5 text-sm"
                                                    disabled={!task.isActive}
                                                >
                                                    <FaCheck className="mr-1" />
                                                    Done
                                                </button>
                                            )}
                                            <Link
                                                to={`/edit-task/${task._id}`}
                                                className="btn-edit rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="btn-delete rounded-lg px-3 py-1.5 text-sm ml-auto"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
