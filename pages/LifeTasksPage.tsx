import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Task, UserRole } from '../types';
import { CategoryIcon } from '../assets/CategoryIcons';
import { searchLifeTaskOnline } from '../services/geminiService';
import AiSearchResult from '../components/AiSearchResult';
import SkeletonLoader from '../components/SkeletonLoader';
import CustomDropdown from '../components/CustomDropdown';
import { useScrollAnimator } from '../hooks/useScrollAnimator';

type Category = Task['category'] | 'All';
type RoleFilter = UserRole | 'All';

const TaskCard: React.FC<{ task: Partial<Task>; index: number }> = ({ task, index }) => {
    const { t, isSimpleMode } = useAppContext();
    const categoryKey = task.category ? `tasks.${task.category.toLowerCase().replace(/\s/g, '')}` : '';
    const [ref, isVisible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.1 });
    
    return (
        <div 
            ref={ref}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col border-2 border-transparent hover:border-brand-teal scroll-reveal ${isVisible ? 'scroll-reveal--visible' : ''} ${isSimpleMode ? 'p-8' : 'p-6'}`}
            style={{ transitionDelay: `${index * 50}ms` }}
        >
            {!isSimpleMode && task.category && <span className="text-sm font-medium text-brand-indigo bg-indigo-100 px-2 py-1 rounded-full self-start dark:bg-indigo-900/50 dark:text-indigo-300">{t(categoryKey) || task.category}</span>}
            <h3 className={`font-semibold mt-4 text-gray-900 dark:text-white ${isSimpleMode ? 'text-2xl' : 'text-xl'}`}>{t(task.title || '', task.title)}</h3>
            <p className="text-brand-gray dark:text-gray-400 mt-2 text-sm flex-grow">{task.purpose}</p>
            {!isSimpleMode && (
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-300">{t('tasks.time')}</p>
                        <p className="text-gray-800 dark:text-gray-100">{task.timeRequired}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-300">{t('tasks.difficulty')}</p>
                        <p className="text-gray-800 dark:text-gray-100">{task.difficulty}</p>
                    </div>
                </div>
            )}
            <Link to={`/task/${task.id}`} className="button-like mt-6 w-full text-center bg-brand-indigo text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-indigo-light transition-colors btn-glow">
                {t('tasks.viewSteps')}
            </Link>
        </div>
    );
};

const LifeTasksPage = () => {
    const { t, isSimpleMode, tasks, updateTasks, isUpdatingTasks, tasksLastUpdated } = useAppContext();
    const categories: Category[] = ['All', 'Documents', 'Finance', 'Career', 'Health', 'Digital Safety', 'Bank', 'Property', 'Law'];
    const roles: RoleFilter[] = ['All', 'general', 'student', 'working', 'parent', 'senior'];

    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [selectedRole, setSelectedRole] = useState<RoleFilter>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    
    useEffect(() => {
        if(tasks.length > 0) setIsLoading(false);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const categoryMatch = selectedCategory === 'All' || task.category === selectedCategory;
            const roleMatch = selectedRole === 'All' || selectedRole === 'general' || task.relevantFor?.includes(selectedRole as UserRole);
            const queryMatch = !searchQuery || 
                task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && roleMatch && queryMatch;
        });
    }, [tasks, selectedCategory, selectedRole, searchQuery]);
    
    const handleAiSearch = async () => {
        if (!searchQuery) return;
        setIsAiSearching(true);
        setAiResult(null);
        const result = await searchLifeTaskOnline(searchQuery);
        setAiResult(result);
        setIsAiSearching(false);
    };

    const categoryOptions = useMemo(() => categories.map(category => ({
        value: category,
        label: t(`tasks.${category.toLowerCase().replace(/\s/g, '')}`) || category,
        icon: category !== 'All' ? <CategoryIcon category={category} /> : null
    })), [t, categories]);
    
    const roleOptions = useMemo(() => roles.map(role => ({
        value: role,
        label: role === 'All' ? t('tasks.all') : t(`tasks.roles.${role}`) || role
    })), [t, roles]);

    const FiltersContent = () => (
        <>
            <CustomDropdown
                label={t('tasks.categoryDropdown')}
                options={categoryOptions}
                selectedValue={selectedCategory}
                onSelect={(value) => setSelectedCategory(value as Category)}
             />
             <CustomDropdown
                label={t('tasks.filterByRole')}
                options={roleOptions}
                selectedValue={selectedRole}
                onSelect={(value) => setSelectedRole(value as RoleFilter)}
             />
        </>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('tasks.title')}</h1>
                    <p className="mt-2 text-lg text-brand-gray dark:text-gray-300">{t('tasks.description')}</p>
                    {tasksLastUpdated && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {t('tasks.lastUpdated')}: {tasksLastUpdated.toLocaleString()}
                        </p>
                    )}
                </div>
                {!isSimpleMode && (
                    <button 
                        onClick={updateTasks}
                        disabled={isUpdatingTasks}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-brand-indigo text-brand-indigo dark:text-brand-indigo-light dark:hover:bg-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className={`w-5 h-5 ${isUpdatingTasks ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m0 0a9 9 0 11-1.586 5.828M9 9l.01.01" transform="rotate(45 12 12)" /></svg>
                        {isUpdatingTasks ? t('tasks.updating') : t('tasks.updateButton')}
                    </button>
                )}
            </div>

            <div className="mt-10 mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    {/* Search Input */}
                    <div className="relative flex-grow w-full">
                        <input
                            type="text"
                            placeholder={t('tasks.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-black dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-full text-base focus:ring-2 focus:ring-brand-indigo-light focus:border-brand-indigo bg-white dark:bg-black transition-colors duration-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
            
                    {/* Desktop Filters */}
                    {!isSimpleMode && (
                         <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto lg:min-w-[500px]">
                             <FiltersContent />
                        </div>
                    )}
                    
                    {/* Mobile Filter Button */}
                    {!isSimpleMode && (
                        <button 
                            onClick={() => setIsFiltersOpen(true)}
                            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-600 rounded-full text-left font-medium text-black dark:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m6-14v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4m0 10v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4" /></svg>
                            <span>{t('schemes.filters')}</span>
                        </button>
                    )}
                </div>
            </div>
            
            {(isLoading || isUpdatingTasks) && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                         <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
                            <SkeletonLoader className="h-5 w-1/3" />
                            <SkeletonLoader className="h-6 w-3/4" />
                            <SkeletonLoader className="h-4 w-full" />
                            <SkeletonLoader className="h-4 w-5/6" />
                            <SkeletonLoader className="h-10 w-full mt-4" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !isUpdatingTasks && filteredTasks.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                    ))}
                </div>
            )}
            
            {!isLoading && !isUpdatingTasks && filteredTasks.length === 0 && !isAiSearching && (
                 <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('tasks.noResults')}</h3>
                    {searchQuery && (
                        <div className="mt-4">
                            <p className="text-brand-gray dark:text-gray-400 mb-4">Would you like to search online for "{searchQuery}"?</p>
                            <button
                                onClick={handleAiSearch}
                                className="button-like bg-brand-teal text-white px-6 py-2 rounded-md font-semibold hover:bg-teal-600 transition-colors btn-glow"
                            >
                                {t('tasks.searchWithAI')}
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {isAiSearching && (
                <div className="space-y-4 mt-8">
                    <SkeletonLoader className="h-8 w-1/3" />
                    <SkeletonLoader className="h-4 w-full" />
                    <SkeletonLoader className="h-4 w-5/6" />
                    <SkeletonLoader className="h-4 w-3/4" />
                </div>
            )}

            {aiResult && (
                <div>
                     <h2 className="text-2xl font-bold text-center my-6 dark:text-white">{t('tasks.aiResultTitle')} "{searchQuery}"</h2>
                    <AiSearchResult content={aiResult} />
                </div>
            )}
            
            <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>{t('tasks.aggregatorDisclaimer')}</p>
            </div>

            {/* Filter Modal */}
            {!isSimpleMode && isFiltersOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-end sm:items-center" onClick={() => setIsFiltersOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full max-w-md m-0 sm:m-4 chatbot-enter" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold dark:text-white">{t('schemes.filters')}</h2>
                            <button onClick={() => setIsFiltersOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <FiltersContent />
                        </div>
                        <button onClick={() => setIsFiltersOpen(false)} className="mt-6 w-full button-like bg-brand-indigo text-white px-4 py-3 rounded-md font-semibold">
                            View Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LifeTasksPage;