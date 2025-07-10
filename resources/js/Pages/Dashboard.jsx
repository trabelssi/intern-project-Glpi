import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import ErrorBoundary from '@/components/dashboard/ErrorBoundary';
import LoadingOverlay from '@/components/dashboard/LoadingOverlay';
import Filters from '@/components/dashboard/Filters';
import StatsCards from '@/components/dashboard/StatsCards';
import TasksPerProjectChart from '@/components/dashboard/TasksPerProjectChart';
import InterventionsChart from '@/components/dashboard/InterventionsChart';
import AnalyticsPerformance from '@/components/dashboard/AnalyticsPerformance';
import TasksList from '@/components/dashboard/TasksList';
import ExportModal from '@/components/dashboard/ExportModal';
import DashboardHeader from '@/Components/dashboard/layout/DashboardHeader';

// Constants
const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

const INITIAL_FILTERS = {
  searchTerm: '',
  statusFilter: 'all',
  projectFilter: 'all',
  timeRange: 'all',
  tableTimeFilter: 'today'
};

export default function Dashboard({
  auth, 
  activeTasks = [],
  interventionsPerProject = [],
  error: serverError = null,
  filters = {},
}) {
  // State management with initial values from props
  const [error, setError] = useState(serverError);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || INITIAL_FILTERS.searchTerm);
  const [statusFilter, setStatusFilter] = useState(filters.statusFilter || INITIAL_FILTERS.statusFilter);
  const [projectFilter, setProjectFilter] = useState(filters.projectFilter || INITIAL_FILTERS.projectFilter);
  const [timeRange, setTimeRange] = useState(filters.timeRange || INITIAL_FILTERS.timeRange);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeBarIndex, setActiveBarIndex] = useState(-1);
  const [interventionTimeRange, setInterventionTimeRange] = useState('all');
  const [interventionStatusFilter, setInterventionStatusFilter] = useState('all');
  const [interventionChartType, setInterventionChartType] = useState('line');
  const [tableTimeFilter, setTableTimeFilter] = useState(INITIAL_FILTERS.tableTimeFilter);

  // Set server error if present
  useEffect(() => {
    if (serverError) {
      setError(serverError);
    }
  }, [serverError]);

  // Process tasks with error handling
  const tasks = useMemo(() => {
    try {
      return Array.isArray(activeTasks) ? activeTasks : (activeTasks?.data || []);
    } catch (err) {
      console.error('Error processing tasks:', err);
      return [];
    }
  }, [activeTasks]);

  // Get unique projects for filter
  const projects = useMemo(() => {
    try {
      return [...new Set(tasks
        .map(task => task.products?.[0]?.project?.name)
        .filter(Boolean)
      )].sort();
    } catch (err) {
      console.error('Error processing projects:', err);
      return [];
    }
  }, [tasks]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    try {
      return tasks.filter(task => {
        const matchesSearch = !searchTerm || 
                           task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.products?.[0]?.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesProject = projectFilter === 'all' || task.products?.[0]?.project?.name === projectFilter;
        
        return matchesSearch && matchesStatus && matchesProject;
      });
    } catch (err) {
      console.error('Error filtering tasks:', err);
      return [];
    }
  }, [tasks, searchTerm, statusFilter, projectFilter]);

  // Calculate metrics using filtered tasks
  const calculatedMetrics = useMemo(() => {
    try {
      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const myCompletedTasks = filteredTasks.filter(t => 
        t.status === TASK_STATUS.COMPLETED && 
        t.assigned_user_id === auth.user.id
      ).length;
      const myActiveTasks = filteredTasks.filter(t => 
        [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS].includes(t.status) && 
        t.assigned_user_id === auth.user.id
      ).length;
      const highPriorityTasks = filteredTasks.filter(t => t.priority === 'high').length;
      const onTimeCompletions = filteredTasks.filter(t => 
        t.status === TASK_STATUS.COMPLETED && 
        t.completed_at && t.due_date &&
        new Date(t.completed_at) <= new Date(t.due_date)
      ).length;

      return {
        efficiency: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        productivity: totalTasks > 0 ? (myCompletedTasks / totalTasks) * 100 : 0,
        workload: totalTasks > 0 ? (myActiveTasks / totalTasks) * 100 : 0,
        priorityRate: totalTasks > 0 ? (highPriorityTasks / totalTasks) * 100 : 0,
        onTimeRate: completedTasks > 0 ? (onTimeCompletions / completedTasks) * 100 : 0,
        totalTasks,
        completedTasks,
        myCompletedTasks,
        myActiveTasks,
        pendingTasks: filteredTasks.filter(t => t.status === TASK_STATUS.PENDING).length,
        inProgressTasks: filteredTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length
      };
    } catch (err) {
      console.error('Error calculating metrics:', err);
      return {
        efficiency: 0,
        productivity: 0,
        workload: 0,
        priorityRate: 0,
        onTimeRate: 0,
        totalTasks: 0,
        completedTasks: 0,
        myCompletedTasks: 0,
        myActiveTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0
      };
    }
  }, [filteredTasks, auth.user.id]);

  // Compute grouped data for selected project
  const groupedProjectStatusData = useMemo(() => {
    if (projectFilter === 'all') return null;

    const projectTasks = filteredTasks.filter(task => 
      task.products?.[0]?.project?.name === projectFilter &&
      (!searchTerm || 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return [
      { status: 'En Attente', value: projectTasks.filter(t => t.status === TASK_STATUS.PENDING).length },
      { status: 'En Cours', value: projectTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length },
      { status: 'Terminées', value: projectTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length },
    ];
  }, [filteredTasks, projectFilter, searchTerm]);

  // Filter interventions data
  const filteredInterventionsData = useMemo(() => {
    try {
      return interventionsPerProject
        .filter(intervention => {
          const matchesSearch = !searchTerm || 
            intervention.project.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesProject = projectFilter === 'all' || 
            intervention.project === projectFilter;

          const matchesStatus = interventionStatusFilter === 'all' || 
            (interventionStatusFilter === 'approved' && intervention.approved > 0) ||
            (interventionStatusFilter === 'rejected' && intervention.refused > 0) ||
            (interventionStatusFilter === 'pending' && intervention.pending > 0);

          return matchesSearch && matchesProject && matchesStatus;
        })
        .map(intervention => ({
          project: intervention.project,
          interventions: Number(intervention.interventions),
          pending: Number(intervention.pending),
          approved: Number(intervention.approved),
          refused: Number(intervention.refused)
        }));
    } catch (err) {
      console.error('Error filtering interventions:', err);
      return [];
    }
  }, [interventionsPerProject, searchTerm, projectFilter, interventionStatusFilter]);

  // Handle time range change
  const handleTimeRangeChange = useCallback(async (value) => {
    try {
      setIsLoading(true);
      setTimeRange(value);
      setInterventionTimeRange(value);
    
      await router.get(
        route('dashboard'),
        { 
          timeRange: value,
          searchTerm,
          statusFilter,
          projectFilter,
          interventionStatusFilter
        },
        {
          preserveState: true,
          preserveScroll: true,
          only: ['activeTasks', 'tasksPerProject', 'interventionsPerProject'],
          onError: (errors) => {
            setError('Failed to update time range');
            console.error('Time range update error:', errors);
          },
        }
      );
    } catch (err) {
      setError('Failed to update time range');
      console.error('Time range update error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, projectFilter, interventionStatusFilter]);

  // Export functionality
  const exportData = useCallback((format) => {
    try {
      const data = {
        stats: {
          totalTasks: filteredTasks.length,
          pendingTasks: filteredTasks.filter(t => t.status === TASK_STATUS.PENDING).length,
          inProgressTasks: filteredTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
          completedTasks: filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
          completionRate: Math.round((filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length / (filteredTasks.length || 1)) * 100)
        },
        tasks: filteredTasks,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob(
        [format === 'json' 
          ? JSON.stringify(data, null, 2)
          : [
          ['Task Title', 'Project', 'Status', 'Priority', 'Created Date'],
          ...filteredTasks.map(task => [
            task.name,
            task.products?.[0]?.project?.name || 'N/A',
                task.status,
                task.priority || 'Normal',
            new Date(task.created_at).toLocaleDateString()
          ])
            ].map(row => row.join(',')).join('\n')
        ],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  }, [filteredTasks]);

  // Function to check if a task was created today
  const isTaskCreatedToday = useCallback((task) => {
    if (!task.created_at) return false;
    const taskDate = new Date(task.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return taskDate >= yesterday;
  }, []);

  // Modified filtered tasks for the table
  const tableFilteredTasks = useMemo(() => {
    try {
      if (tableTimeFilter === 'today') {
        return filteredTasks.filter(task => isTaskCreatedToday(task));
      }
      return filteredTasks;
    } catch (err) {
      console.error('Error filtering table tasks:', err);
      return [];
    }
  }, [filteredTasks, tableTimeFilter, isTaskCreatedToday]);

  // Stats for the cards
  const stats = useMemo(() => {
    const totalTasks = filteredTasks.length;
    const pendingTasks = filteredTasks.filter(t => t.status === TASK_STATUS.PENDING).length;
    const inProgressTasks = filteredTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
    const completedTasks = filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    
    const myPendingTasks = filteredTasks.filter(t => t.status === TASK_STATUS.PENDING && t.assigned_user_id === auth.user.id).length;
    const myInProgressTasks = filteredTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS && t.assigned_user_id === auth.user.id).length;
    const myCompletedTasks = filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED && t.assigned_user_id === auth.user.id).length;
    const myTotalTasks = myPendingTasks + myInProgressTasks + myCompletedTasks;

    return [
      {
        key: 'total',
        title: 'Total Tickets',
        value: totalTasks,
        change: totalTasks > 0 ? `${((myTotalTasks / totalTasks) * 100).toFixed(1)}% mes tickets` : '0% mes tickets',
        isPositive: true
      },
      {
        key: 'pending',
        title: 'Tickets en Attente',
        value: pendingTasks,
        change: pendingTasks > 0 ? `${((myPendingTasks / pendingTasks) * 100).toFixed(1)}% mes tickets` : '0% mes tickets',
        isPositive: true
      },
      {
        key: 'inProgress',
        title: 'En Cours',
        value: inProgressTasks,
        change: inProgressTasks > 0 ? `${((myInProgressTasks / inProgressTasks) * 100).toFixed(1)}% mes tickets` : '0% mes tickets',
        isPositive: true
      },
      {
        key: 'completed',
        title: 'Tickets Terminés',
        value: completedTasks,
        change: completedTasks > 0 ? `${((myCompletedTasks / completedTasks) * 100).toFixed(1)}% mes tickets` : '0% mes tickets',
        isPositive: true
      }
    ];
  }, [filteredTasks, auth.user.id]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <DashboardHeader 
          auth={auth} 
          setShowExportModal={setShowExportModal} 
        />
      }
    >
      <Head title="Tableau de Bord Administrateur" />
      
      <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900 p-6">
        <ErrorBoundary>
          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="ml-2 text-red-300 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 rounded"
              >
                <span className="sr-only">Dismiss error</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <LoadingOverlay isLoading={isLoading} />
          
          {/* Advanced Controls */}
          <ErrorBoundary>
            <div className="mb-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
              <Filters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                projectFilter={projectFilter}
                setProjectFilter={setProjectFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                timeRange={timeRange}
                handleTimeRangeChange={handleTimeRangeChange}
                projects={projects}
                onResetFilters={() => {
                  router.get(route('dashboard'), {}, {
                    replace: true,
                    preserveState: false,
                    preserveScroll: false
                  });
                }}
              />
            </div>
          </ErrorBoundary>

          {/* Statistics Cards */}
          <ErrorBoundary>
            <StatsCards 
              stats={stats} 
              timeRange={timeRange}
            />
          </ErrorBoundary>

          {/* Main Content Area */}
          <ErrorBoundary>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 h-full flex flex-col">
                <TasksPerProjectChart
                  tasks={tasks}
                  searchTerm={searchTerm}
                  projectFilter={projectFilter}
                  groupedProjectStatusData={groupedProjectStatusData}
                  activeBarIndex={activeBarIndex}
                  setActiveBarIndex={setActiveBarIndex}
                  timeRange={timeRange}
                />
                <InterventionsChart
                  filteredInterventionsData={filteredInterventionsData}
                  interventionChartType={interventionChartType}
                  setInterventionChartType={setInterventionChartType}
                  searchTerm={searchTerm}
                  interventionStatusFilter={interventionStatusFilter}
                  timeRange={timeRange}
                />
              </div>
              <AnalyticsPerformance 
                calculatedMetrics={calculatedMetrics}
                filteredTasks={filteredTasks}
                timeRange={timeRange}
              />
            </div>
          </ErrorBoundary>

          {/* Tasks List */}
          <ErrorBoundary>
            <div className="flex items-center justify-end gap-3 mb-4">
              <div className="relative flex items-center">
                <label 
                  htmlFor="tableTimeFilter" 
                  className="mr-3 text-gray-300 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Période :
                </label>
                <div className="relative">
                  <select
                    id="tableTimeFilter"
                    value={tableTimeFilter}
                    onChange={e => setTableTimeFilter(e.target.value)}
                    className="appearance-none bg-gray-800/50 backdrop-blur-xl text-gray-200 px-4 py-2 pr-8 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 hover:bg-gray-800/70"
                  >
                    <option value="all">Toutes les tâches</option>
                    <option value="today">Dernières 24 heures</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <TasksList
              tableFilteredTasks={tableFilteredTasks}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              projectFilter={projectFilter}
              timeRange={timeRange}
            />
          </ErrorBoundary>

          {/* Export Modal */}
          <ErrorBoundary>
            <ExportModal
              showExportModal={showExportModal}
              setShowExportModal={setShowExportModal}
              exportData={exportData}
            />
          </ErrorBoundary>
        </ErrorBoundary>
      </div>
    </AuthenticatedLayout>
  );
}