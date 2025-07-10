import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { TASK_STATUS_CLASS_MAP, TASK_STATUS_TEXT_MAP } from '@/constants.jsx';
import { 
    BellIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, 
    FolderIcon, CalendarIcon, ChartBarIcon, MagnifyingGlassIcon,
    ExclamationTriangleIcon, FireIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import TaskPieChart from '@/Components/TaskPieChart';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import debounce from 'lodash/debounce';

// Quick Actions Component
const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all duration-300 shadow-lg backdrop-blur-xl border border-white/10`}
        onClick={onClick}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </motion.button>
);

// Task Priority Badge Component
const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
        high: { color: 'bg-rose-500/20 text-rose-300', icon: FireIcon },
        medium: { color: 'bg-amber-500/20 text-amber-300', icon: ExclamationTriangleIcon },
        low: { color: 'bg-emerald-500/20 text-emerald-300', icon: ArrowTrendingUpIcon },
    };

    const config = priorityConfig[priority] || priorityConfig.low;
    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${config.color} text-xs font-medium backdrop-blur-xl`}>
            <Icon className="w-3.5 h-3.5" />
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
};

export default function UserDashboard({
    auth,
    myPendingTasks,
    myCompletedTasks,
    myInProgressTasks,
    activeTasks,
    recentNotifications
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const chartData = useMemo(() => [
        { name: 'En Attente', value: myPendingTasks },
        { name: 'En Cours', value: myInProgressTasks },
        { name: 'Terminées', value: myCompletedTasks },
    ], [myPendingTasks, myInProgressTasks, myCompletedTasks]);

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.15,
                duration: 0.5,
                ease: "easeOut"
            },
        }),
    };

    const taskStatusGlow = {
        pending: 'hover:shadow-violet-500/20',
        'in-progress': 'hover:shadow-blue-500/20',
        completed: 'hover:shadow-emerald-500/20',
    };

    const taskStatusBorder = {
        pending: 'border-violet-400/50',
        'in-progress': 'border-blue-400/50',
        completed: 'border-emerald-400/50',
    };

    // Filter tasks based on search query and status
    const filteredTasks = useMemo(() => {
        return activeTasks.data.filter(task => {
            const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = selectedFilter === 'all' || task.status === selectedFilter;
            return matchesSearch && matchesFilter;
        });
    }, [activeTasks.data, searchQuery, selectedFilter]);

    // Calculate days until due date
    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSearch = debounce((value) => {
        setSearchQuery(value);
    }, 300);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <motion.h2 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl font-bold text-white"
                        >
                            Bienvenue, {auth.user.name}
                        </motion.h2>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-4">
                        <QuickAction 
                            icon={BellIcon} 
                            label="Notifications" 
                            onClick={() => window.location.href = route('notifications.index')}
                        />
                        <QuickAction 
                            icon={ClockIcon} 
                            label="Mes Tâches" 
                            onClick={() => window.location.href = route('task.myTasks')}
                        />
                    </div>
                </div>
            }
        >
            <Head title="Tableau de Bord" />

            <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'En Attente', value: myPendingTasks, color: 'from-violet-500/20 to-violet-600/20', icon: ClockIcon, textColor: 'text-violet-300' },
                        { label: 'En Cours', value: myInProgressTasks, color: 'from-blue-500/20 to-blue-600/20', icon: ExclamationCircleIcon, textColor: 'text-blue-300' },
                        { label: 'Terminés', value: myCompletedTasks, color: 'from-emerald-500/20 to-emerald-600/20', icon: CheckCircleIcon, textColor: 'text-emerald-300' },
                    ].map(({ label, value, color, icon: Icon, textColor }, i) => (
                        <motion.div 
                            key={i} 
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className={`bg-gradient-to-br ${color} backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                                    <div className={`${textColor}`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-white/70 text-sm font-medium mb-2">{label}</h3>
                            <p className="text-white text-4xl font-bold">{value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tasks Overview */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <ChartBarIcon className='w-7 h-7 text-indigo-400' />
                                    Mes Tickets Actifs
                                </h3>
                                
                                {/* Search and Filter */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            className="pl-11 pr-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64 backdrop-blur-xl"
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
                                    </div>
                                    
                                    <select
                                        className="bg-white/5 text-white rounded-xl border border-white/10 px-4 py-3 backdrop-blur-xl appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        value={selectedFilter}
                                        onChange={(e) => setSelectedFilter(e.target.value)}
                                    >
                                        <option value="all">Tous</option>
                                        <option value="pending">En Attente</option>
                                        <option value="in-progress">En Cours</option>
                                        <option value="completed">Terminés</option>
                                    </select>
                                </div>
                            </div>

                            <AnimatePresence>
                                {filteredTasks.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-12 text-white/50"
                                    >
                                        Aucun ticket trouvé
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTasks.map((task) => {
                                            const daysUntilDue = getDaysUntilDue(task.due_date);
                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className={`bg-white/5 rounded-xl p-6 border ${taskStatusBorder[task.status]} ${taskStatusGlow[task.status]} transition-all duration-300 group backdrop-blur-xl hover:bg-white/10`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-3">
                                                            <Link
                                                                href={route('task.show', task.id)}
                                                                className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors duration-300"
                                                            >
                                                                {task.name}
                                                            </Link>
                                                            <div className="flex items-center gap-3">
                                                                <PriorityBadge priority={task.priority || 'low'} />
                                                                <span className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${TASK_STATUS_CLASS_MAP[task.status]} backdrop-blur-xl`}>
                                                                    {TASK_STATUS_TEXT_MAP[task.status]}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                                                        <div className='flex items-center gap-3'>
                                                            <FolderIcon className='w-5 h-5 text-white/50' />
                                                            <span>
                                                                {task.products && task.products.length > 0 && task.products[0].project ? task.products[0].project.name : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center gap-3'>
                                                            <CalendarIcon className='w-5 h-5 text-white/50' />
                                                            <span className={`
                                                                ${daysUntilDue <= 1 ? 'text-rose-300' : 
                                                                  daysUntilDue <= 3 ? 'text-amber-300' : 
                                                                  'text-white/70'}
                                                            `}>
                                                                Date limite: {task.due_date}
                                                                {daysUntilDue <= 3 && ` (${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''} restant${daysUntilDue > 1 ? 's' : ''})`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {task.progress !== undefined && (
                                                        <div className="mt-4">
                                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                                                                    style={{ width: `${task.progress}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-white/50 mt-2">{task.progress}% complété</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Notifications and Stats */}
                    <div className="space-y-8">
                        {/* Notifications */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
                                <span className='flex items-center gap-3'>
                                    <BellIcon className="w-7 h-7 text-purple-400" />
                                    <span>Notifications Récentes</span>
                                </span>
                                <Link
                                    href={route('notifications.index')}
                                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                                >
                                    Voir tout →
                                </Link>
                            </h3>
                            <AnimatePresence>
                                <div className="space-y-4">
                                    {recentNotifications?.slice(0, 3).map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4 }}
                                            className={`bg-white/5 rounded-xl p-4 backdrop-blur-xl transition-all duration-300 ${!notification.read_at ? 'border border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'border border-white/10'}`}
                                        >
                                            {!notification.read_at && (
                                                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_theme(colors.indigo.400)] flex-shrink-0"></div>
                                            )}
                                            <div className="flex-grow">
                                                <p className="text-sm text-white/90">
                                                    {notification.data?.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    {notification.data?.category && (
                                                        <span className="text-xs px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 backdrop-blur-xl">
                                                            {notification.data.category}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-white/50">
                                                        {new Date(notification.created_at).toLocaleString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </div>

                        {/* Task Distribution Chart */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                            <TaskPieChart data={chartData} title="Distribution des Tickets" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
