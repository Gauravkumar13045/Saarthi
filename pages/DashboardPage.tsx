import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Link } from 'react-router-dom';
import { UserRole, Task, Scheme } from '../types';
import { fetchTaskById, fetchSchemeById } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { useScrollAnimator } from '../hooks/useScrollAnimator';

const DashboardPage = () => {
    const { t, userRole, setUserRole, progress, getTaskProgress, savedTasks, savedSchemes } = useAppContext();
    const [startedTasks, setStartedTasks] = useState<(Task | null)[]>([]);
    const [savedTaskObjects, setSavedTaskObjects] = useState<(Task | null)[]>([]);
    const [savedSchemeObjects, setSavedSchemeObjects] = useState<(Scheme | null)[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const roles: UserRole[] = ['general', 'student', 'working', 'parent', 'senior'];

    const [progressRef, isProgressVisible] = useScrollAnimator<HTMLDivElement>();
    const [savedRef, isSavedVisible] = useScrollAnimator<HTMLDivElement>();
    const [recommendedRef, isRecommendedVisible] = useScrollAnimator<HTMLDivElement>();
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            // Fetch details for all tasks and schemes mentioned in localStorage
            const startedTaskPromises = Object.keys(progress).map(id => fetchTaskById(id, false).catch(() => null));
            const savedTaskPromises = savedTasks.map(id => fetchTaskById(id, false).catch(() => null));
            const savedSchemePromises = savedSchemes.map(id => fetchSchemeById(id).catch(() => null));

            const [started, savedT, savedS] = await Promise.all([
                Promise.all(startedTaskPromises),
                Promise.all(savedTaskPromises),
                Promise.all(savedSchemePromises)
            ]);
            
            setStartedTasks(started.filter(Boolean));
            setSavedTaskObjects(savedT.filter(Boolean));
            setSavedSchemeObjects(savedS.filter(Boolean));
            
            setIsLoading(false);
        };

        fetchDashboardData();
    }, [progress, savedTasks, savedSchemes]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
            <p className="mt-2 text-lg text-brand-gray dark:text-gray-300">{t('dashboard.description')}</p>

            <div className="mt-10 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Task Progress */}
                    <div ref={progressRef} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 scroll-reveal ${isProgressVisible ? 'scroll-reveal--visible' : ''}`}>
                        <h2 className="text-2xl font-semibold mb-4 dark:text-white">{t('dashboard.taskProgress')}</h2>
                        {isLoading ? (
                             <div className="space-y-4">
                                <SkeletonLoader className="h-10 w-full" />
                                <SkeletonLoader className="h-10 w-full" />
                             </div>
                        ) : startedTasks.length > 0 ? (
                            <div className="space-y-4">
                                {startedTasks.map(task => task && (
                                    <div key={task.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <Link to={`/task/${task.id}`} className="font-semibold text-brand-indigo dark:text-brand-indigo-light hover:underline">{task.title}</Link>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{Math.round(getTaskProgress(task.id))}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-gradient-to-r from-brand-teal via-brand-indigo to-brand-pink h-2.5 rounded-full transition-all duration-500" style={{ width: `${getTaskProgress(task.id)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-brand-gray dark:text-gray-400">{t('dashboard.noTasksStarted')}</p>
                        )}
                    </div>
                    
                    {/* Saved Items */}
                    <div ref={savedRef} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 scroll-reveal ${isSavedVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '150ms' }}>
                        <h2 className="text-2xl font-semibold mb-4 dark:text-white">{t('dashboard.savedItems')}</h2>
                         {isLoading ? (
                             <div className="space-y-4">
                                <SkeletonLoader className="h-6 w-1/3" />
                                <SkeletonLoader className="h-5 w-1/2" />
                                <SkeletonLoader className="h-5 w-2/3" />
                             </div>
                        ) : savedTaskObjects.length === 0 && savedSchemeObjects.length === 0 ? (
                            <p className="text-brand-gray dark:text-gray-400">{t('dashboard.noSavedItems')}</p>
                        ) : (
                            <div className="space-y-6">
                                {savedTaskObjects.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b pb-1 dark:border-gray-600">{t('dashboard.savedTasks')}</h3>
                                        <ul className="space-y-2 list-disc list-inside">
                                            {savedTaskObjects.map(task => task && (
                                                <li key={task.id}>
                                                    <Link to={`/task/${task.id}`} className="text-brand-indigo dark:text-brand-indigo-light hover:underline">{t(task.title, task.title)}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {savedSchemeObjects.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b pb-1 dark:border-gray-600">{t('dashboard.savedSchemes')}</h3>
                                        <ul className="space-y-2 list-disc list-inside">
                                            {savedSchemeObjects.map(scheme => scheme && (
                                                <li key={scheme.id}>
                                                    <Link to={`/scheme/${scheme.id}`} className="text-brand-indigo dark:text-brand-indigo-light hover:underline">{t(scheme.name, scheme.name)}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recommended Schemes */}
                    <div ref={recommendedRef} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 scroll-reveal ${isRecommendedVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                        <h2 className="text-2xl font-semibold mb-4 dark:text-white">{t('dashboard.recommendedSchemes')}</h2>
                        <p className="text-brand-gray dark:text-gray-400">Feature coming soon! Recommendations will be based on your role and completed tasks.</p>
                    </div>
                </div>

                <aside className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('dashboard.selectRole')}</h2>
                        <div className="flex flex-col space-y-2">
                             {roles.map(role => (
                                <button 
                                    key={role} 
                                    onClick={() => setUserRole(role)}
                                    className={`w-full p-2 border rounded-md text-left transition-all duration-200 font-semibold transform hover:scale-105 ${
                                        userRole === role
                                        ? 'bg-brand-indigo text-white border-brand-indigo-light'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-indigo-100 hover:border-indigo-300 dark:hover:bg-gray-600 dark:hover:border-indigo-500'
                                    }`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Selecting a role will help us personalize content for you.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default DashboardPage;