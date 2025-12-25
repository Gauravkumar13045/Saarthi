import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Scheme } from '../types';
import CustomDropdown from '../components/CustomDropdown';
import { fetchSchemes } from '../services/api';
import { searchSchemeOnline } from '../services/geminiService';
import AiSearchResult from '../components/AiSearchResult';
import SkeletonLoader from '../components/SkeletonLoader';
import { useScrollAnimator } from '../hooks/useScrollAnimator';

const SchemeCard: React.FC<{ scheme: Scheme; index: number }> = ({ scheme, index }) => {
    const { t, isSimpleMode } = useAppContext();
    const [ref, isVisible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.1 });

    const statusClasses: {[key: string]: string} = {
        'Active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Upcoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Ending Soon': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Expired': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <div 
            ref={ref}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col border-2 border-transparent hover:border-brand-teal scroll-reveal ${isVisible ? 'scroll-reveal--visible' : ''} ${isSimpleMode ? 'p-8' : 'p-6'}`}
            style={{ transitionDelay: `${index * 50}ms` }}
        >
            {!isSimpleMode && (
                <div className="flex justify-between items-start">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[scheme.status]}`}>{t(`schemes.${scheme.status.toLowerCase().replace(' ','')}`)||scheme.status}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{scheme.type} {scheme.state ? `(${scheme.state})` : ''}</span>
                </div>
            )}
            <h3 className={`font-semibold mt-3 text-gray-900 dark:text-white ${isSimpleMode ? 'text-2xl' : 'text-xl'}`}>{t(scheme.name, scheme.name)}</h3>
            <p className="text-brand-gray dark:text-gray-400 mt-2 text-sm flex-grow">{scheme.description.substring(0, 100)}...</p>
            {!isSimpleMode && (
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Category: <span className="font-semibold dark:text-gray-100">{scheme.category}</span></p>
                    {scheme.deadline && <p className="text-sm text-red-600 dark:text-red-400 mt-1">Deadline: <span className="font-semibold">{scheme.deadline}</span></p>}
                </div>
            )}
            <Link to={`/scheme/${scheme.id}`} className="button-like mt-5 w-full text-center bg-brand-indigo text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-indigo-light transition-colors btn-glow">
                {t('schemes.viewDetails')}
            </Link>
        </div>
    );
};

const GovtSchemesPage = () => {
    const { t, schemes, updateSchemes, isUpdatingSchemes, isSimpleMode, schemesLastUpdated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayedSchemes, setDisplayedSchemes] = useState<Scheme[]>([]);
    
    const [filters, setFilters] = useState({ 
        type: 'All', 
        state: 'All',
        status: 'All', 
        category: 'All' 
    });
    const [sort, setSort] = useState('Newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        const loadSchemes = async () => {
            setIsLoading(true);
            setError(null);
            setAiResult(null);
            try {
                const response = await fetchSchemes({ ...filters, query: searchQuery }, sort);
                setDisplayedSchemes(response.data);
            } catch (err) {
                setError('Failed to load schemes.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSchemes();
    }, [filters, sort, searchQuery]);
    
    const handleAiSearch = async () => {
        if (!searchQuery) return;
        setIsAiSearching(true);
        setAiResult(null);
        const result = await searchSchemeOnline(searchQuery);
        setAiResult(result);
        setIsAiSearching(false);
    };

    const handleFilterChange = (name: keyof typeof filters, value: string) => {
        const newFilters = { ...filters, [name]: value };
        // Reset state filter if type is changed from 'State'
        if (name === 'type' && value !== 'State') {
            newFilters.state = 'All';
        }
        setFilters(newFilters);
    };

    const categories = useMemo(() => ['All', ...Array.from(new Set(schemes.map(s => s.category)))], [schemes]);
    const availableStates = useMemo(() => ['All', ...Array.from(new Set(schemes.filter(s => s.state).map(s => s.state!)))], [schemes]);
    
    const filterOptions = {
        type: ['All', 'Central', 'State'],
        state: availableStates,
        status: ['All', 'Active', 'Upcoming', 'Ending Soon', 'Expired'],
        category: categories,
        sort: ['Newest', 'Oldest', 'Deadline Nearest'],
    };

    const FiltersContent = () => (
        <>
            <CustomDropdown label={t('schemes.type')} options={filterOptions.type.map(o => ({label: t(`schemes.${o.toLowerCase().replace(' ','')}`) || o, value: o}))} selectedValue={filters.type} onSelect={(v) => handleFilterChange('type', v)} />
            {filters.type === 'State' && (
                <CustomDropdown label={t('schemes.selectState')} options={filterOptions.state.map(s => ({label: s === 'All' ? t('schemes.all') : s, value: s}))} selectedValue={filters.state} onSelect={(v) => handleFilterChange('state', v)} />
            )}
            <CustomDropdown label={t('schemes.status')} options={filterOptions.status.map(o => ({label: t(`schemes.${o.toLowerCase().replace(' ','')}`) || o, value: o}))} selectedValue={filters.status} onSelect={(v) => handleFilterChange('status', v)} />
            <CustomDropdown 
                label={t('schemes.category')} 
                options={filterOptions.category.map(o => ({
                    label: o === 'All' 
                        ? t('schemes.all') 
                        : t(`schemes.scheme_categories.${o.toLowerCase().replace(/ & /g, '&').replace(/\s/g, '')}`) || o,
                    value: o
                }))} 
                selectedValue={filters.category} 
                onSelect={(v) => handleFilterChange('category', v)} 
            />
            <CustomDropdown label={t('schemes.sort')} options={filterOptions.sort.map(o => ({label: t(`schemes.${o.toLowerCase().replace(' ','')}`) || o, value: o}))} selectedValue={sort} onSelect={setSort} />
        </>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('schemes.title')}</h1>
                    <p className="mt-2 text-lg text-brand-gray dark:text-gray-300">{t('schemes.description')}</p>
                    {schemesLastUpdated && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {t('schemes.lastUpdated')}: {schemesLastUpdated.toLocaleString()}
                        </p>
                    )}
                </div>
                {!isSimpleMode && (
                    <button 
                        onClick={updateSchemes}
                        disabled={isUpdatingSchemes}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-brand-indigo text-brand-indigo dark:text-brand-indigo-light dark:hover:bg-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className={`w-5 h-5 ${isUpdatingSchemes ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m0 0a9 9 0 11-1.586 5.828M9 9l.01.01" transform="rotate(45 12 12)" /></svg>
                        {isUpdatingSchemes ? t('schemes.updating') : t('schemes.updateButton')}
                    </button>
                )}
            </div>
            
            <div className="mt-10 mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                {/* Search Input */}
                <div className="relative flex-grow w-full">
                    <input
                        type="text"
                        placeholder={t('schemes.searchPlaceholder')}
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
                    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end mt-6">
                        <FiltersContent />
                    </div>
                )}
                 {/* Mobile Filter Button */}
                 {!isSimpleMode && (
                    <button 
                        onClick={() => setIsFiltersOpen(true)}
                        className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-600 rounded-full text-left font-medium text-black dark:text-white mt-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m6-14v2m0-2a2 2 0 100 4m0-4a2 2 0 110 4m0 10v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4" /></svg>
                        <span>{t('schemes.filters')}</span>
                    </button>
                )}
            </div>

            {error && <div className="text-center text-red-500">{error}</div>}
            
            {isLoading && (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                         <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
                            <SkeletonLoader className="h-5 w-1/4" />
                            <SkeletonLoader className="h-6 w-3/4" />
                            <SkeletonLoader className="h-4 w-full" />
                            <SkeletonLoader className="h-4 w-5/6" />
                            <SkeletonLoader className="h-10 w-full mt-4" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !error && displayedSchemes.length > 0 && (
                <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8`}>
                    {displayedSchemes.map((scheme, index) => (
                        <SchemeCard key={scheme.id} scheme={scheme} index={index} />
                    ))}
                </div>
            )}

            {!isLoading && displayedSchemes.length === 0 && !isAiSearching && (
                 <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('schemes.noResults')}</h3>
                    {searchQuery && (
                        <div className="mt-4">
                            <p className="text-brand-gray dark:text-gray-400 mb-4">Would you like to search online for "{searchQuery}"?</p>
                            <button
                                onClick={handleAiSearch}
                                className="button-like bg-brand-teal text-white px-6 py-2 rounded-md font-semibold hover:bg-teal-600 transition-colors btn-glow"
                            >
                                {t('schemes.searchWithAI')}
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
                     <h2 className="text-2xl font-bold text-center my-6 dark:text-white">{t('schemes.aiResultTitle')} "{searchQuery}"</h2>
                    <AiSearchResult content={aiResult} />
                </div>
            )}
            
            <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>{t('schemes.aggregatorDisclaimer')}</p>
            </div>
            
             {/* Filter Modal */}
             {!isSimpleMode && isFiltersOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-end sm:items-center" onClick={() => setIsFiltersOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full max-w-md m-0 sm:m-4 chatbot-enter max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 flex-shrink-0">
                            <h2 className="text-xl font-semibold dark:text-white">{t('schemes.filters')}</h2>
                            <button onClick={() => setIsFiltersOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-2">
                            <FiltersContent />
                        </div>
                        <button onClick={() => setIsFiltersOpen(false)} className="mt-6 w-full button-like bg-brand-indigo text-white px-4 py-3 rounded-md font-semibold flex-shrink-0">
                            View Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovtSchemesPage;