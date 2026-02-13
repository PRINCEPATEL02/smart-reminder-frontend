import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaCheckCircle, FaClock, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import api from '../utils/api';

const Stats = () => {
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedToday: 0,
        streak: 0,
        weeklyProgress: [],
    });
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/tasks');
                setTasks(data);

                // Calculate stats
                const today = new Date();
                const todayCompleted = data.filter(task => {
                    // This would need completion history - simplified for now
                    return false;
                }).length;

                setStats({
                    totalTasks: data.filter(t => t.status === 'Active').length,
                    completedToday: 0,
                    streak: 0, // Would calculate from history
                    weeklyProgress: getWeeklyProgress(data),
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getWeeklyProgress = (tasks) => {
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return days.map(day => ({
            date: day,
            dayName: format(day, 'EEE'),
            dayNum: format(day, 'd'),
            isToday: isSameDay(day, today),
            completed: Math.floor(Math.random() * tasks.length), // Mock data - would come from history
            total: tasks.length,
        }));
    };

    const getCompletionRate = () => {
        if (stats.totalTasks === 0) return 0;
        return Math.round((stats.completedToday / stats.totalTasks) * 100);
    };

    const getTypeDistribution = () => {
        const types = {};
        tasks.forEach(task => {
            types[task.type] = (types[task.type] || 0) + 1;
        });
        return Object.entries(types).map(([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / tasks.length) * 100),
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const typeDistribution = getTypeDistribution();

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link to="/" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-700">
                    <FaArrowLeft className="text-primary-700 dark:text-white" />
                </Link>
                <h1 className="text-xl font-bold text-primary-700 dark:text-white">Your Statistics</h1>
            </div>

            {/* Weekly Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-6"
            >
                <h3 className="font-semibold text-primary-700 dark:text-white mb-4 flex items-center gap-2">
                    <FaCalendar className="text-primary-500" />
                    This Week
                </h3>
                <div className="grid grid-cols-7 gap-2">
                    {stats.weeklyProgress.map((day, idx) => (
                        <div
                            key={idx}
                            className={`text-center p-2 rounded-xl ${day.isToday
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-50 text-primary-700 dark:text-white'
                                }`}
                        >
                            <div className="text-xs font-medium mb-1">{day.dayName}</div>
                            <div className="text-lg font-bold">{day.dayNum}</div>
                            <div className="mt-1">
                                {day.completed > 0 ? (
                                    <div className="flex justify-center">
                                        <FaCheckCircle className={`text-xs ${day.isToday ? 'text-white' : 'text-emerald-500'}`} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                >
                    <FaCheckCircle className="text-2xl mb-2 opacity-80" />
                    <div className="text-3xl font-bold">{stats.completedToday}</div>
                    <div className="text-sm opacity-80">Completed Today</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                >
                    <FaFire className="text-2xl mb-2 opacity-80" />
                    <div className="text-3xl font-bold">{stats.streak}</div>
                    <div className="text-sm opacity-80">Day Streak</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <FaClock className="text-xl mb-2 text-primary-500" />
                    <div className="text-2xl font-bold">{stats.totalTasks}</div>
                    <div className="text-sm text-primary-500 dark:text-gray-300">Active Reminders</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="card"
                >
                    <div className="relative mb-2">
                        <FaClock className="text-xl text-primary-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-500">{getCompletionRate()}%</span>
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{getCompletionRate()}%</div>
                    <div className="text-sm text-primary-500 dark:text-gray-300">Completion Rate</div>
                </motion.div>
            </div>

            {/* Type Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card mb-6"
            >
                <h3 className="font-semibold text-primary-700 dark:text-white mb-4">Reminder Types</h3>
                {typeDistribution.length === 0 ? (
                    <p className="text-primary-500 dark:text-gray-300 text-center py-4">No reminders yet</p>
                ) : (
                    <div className="space-y-4">
                        {typeDistribution.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-primary-700 dark:text-white">{item.type}</span>
                                    <span className="text-sm text-primary-500 dark:text-gray-300">{item.count} ({item.percentage}%)</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                                        className="h-full bg-primary-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
            >
                <h3 className="font-semibold text-primary-700 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <Link
                        to="/add-task"
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-500 flex items-center justify-center">
                            <FaCheckCircle />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-primary-700 dark:text-white">Add New Reminder</div>
                            <div className="text-sm text-primary-500 dark:text-gray-300">Create a new reminder</div>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Stats;
