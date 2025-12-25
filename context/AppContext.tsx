import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { locales } from '../data/locales';
import { Progress, UserRole, Scheme, Theme, Task, Translation } from '../types';
import { translateLocale } from '../services/geminiService';
import { fetchSchemes, updateSchemesOnServer, fetchTasks, updateTasksOnServer } from '../services/api';
import { INDIAN_LANGUAGES } from '../constants';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, textToKeep?: string) => string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  progress: Progress;
  updateProgress: (taskId: string, stepId: string, completed: boolean) => void;
  getTaskProgress: (taskId:string) => number;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  schemes: Scheme[];
  updateSchemes: () => Promise<void>;
  isUpdatingSchemes: boolean;
  schemesLastUpdated: Date | null;
  tasks: Partial<Task>[];
  updateTasks: () => Promise<void>;
  isUpdatingTasks: boolean;
  tasksLastUpdated: Date | null;
  toast: { message: string; type: 'success' | 'error' } | null;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  savedTasks: string[];
  toggleSaveTask: (taskId: string) => void;
  savedSchemes: string[];
  toggleSaveScheme: (schemeId: string) => void;
  isTranslating: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const UNTRANSLATABLE_WORDS_HI = ['PAN Card', 'KYC', 'RTI', 'NSDL', 'UTIITSL', 'DBT', 'SSY', 'APY', 'PM-KISAN', 'AI'];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => localStorage.getItem('saarthi-lang') || 'en');
  const [userRole, setUserRoleState] = useState<UserRole>(() => (localStorage.getItem('saarthi-role') as UserRole) || 'general');
  const [progress, setProgress] = useState<Progress>(() => JSON.parse(localStorage.getItem('saarthi-progress') || '{}'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isUpdatingSchemes, setIsUpdatingSchemes] = useState(false);
  const [schemesLastUpdated, setSchemesLastUpdated] = useState<Date | null>(null);

  const [tasks, setTasks] = useState<Partial<Task>[]>([]);
  const [isUpdatingTasks, setIsUpdatingTasks] = useState(false);
  const [tasksLastUpdated, setTasksLastUpdated] = useState<Date | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('saarthi-theme') as Theme) || 'system');
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => localStorage.getItem('saarthi-simple-mode') === 'true');
  const [savedTasks, setSavedTasks] = useState<string[]>(() => JSON.parse(localStorage.getItem('saarthi-saved-tasks') || '[]'));
  const [savedSchemes, setSavedSchemes] = useState<string[]>(() => JSON.parse(localStorage.getItem('saarthi-saved-schemes') || '[]'));

  const [customLocale, setCustomLocale] = useState<Translation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
      const loadInitialData = async () => {
          try {
              const [schemesResponse, tasksResponse] = await Promise.all([
                 fetchSchemes({type: 'All', status: 'All', category: 'All', query: ''}, 'Newest'),
                 fetchTasks({ category: 'All', query: '', role: 'general' }, isSimpleMode)
              ]);
              setSchemes(schemesResponse.data);
              setSchemesLastUpdated(new Date());

              setTasks(tasksResponse.data);
              setTasksLastUpdated(new Date());
          } catch (error) {
              console.error("Failed to load initial data:", error);
              setToast({ message: 'Could not load initial data.', type: 'error' });
          }
      };
      loadInitialData();
  }, [isSimpleMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('saarthi-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('saarthi-simple-mode', String(isSimpleMode));
    document.body.classList.toggle('ultra-simple-mode', isSimpleMode);
  }, [isSimpleMode]);

  useEffect(() => {
    const initialLang = localStorage.getItem('saarthi-lang') || 'en';
    if (initialLang !== 'en' && initialLang !== 'hi') {
        const cachedLocale = localStorage.getItem(`saarthi-locale-${initialLang}`);
        if (cachedLocale) {
            setCustomLocale(JSON.parse(cachedLocale));
        } else {
            // If no cache, default to English but keep lang preference
            setLanguageState('en'); 
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('saarthi-role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('saarthi-progress', JSON.stringify(progress));
  }, [progress]);
  
  useEffect(() => {
    localStorage.setItem('saarthi-saved-tasks', JSON.stringify(savedTasks));
  }, [savedTasks]);

  useEffect(() => {
    localStorage.setItem('saarthi-saved-schemes', JSON.stringify(savedSchemes));
  }, [savedSchemes]);
  
  const setLanguage = async (lang: string) => {
    if (lang === language) return;

    if (lang === 'en' || lang === 'hi') {
      setCustomLocale(null);
      setLanguageState(lang);
      localStorage.setItem('saarthi-lang', lang);
    } else {
      setIsTranslating(true);
      const langName = INDIAN_LANGUAGES.find(l => l.code === lang)?.name || lang;
      setToast({ message: `Translating to ${langName}...`, type: 'success' });
      try {
        const cachedLocale = localStorage.getItem(`saarthi-locale-${lang}`);
        if (cachedLocale) {
          setCustomLocale(JSON.parse(cachedLocale));
        } else {
          const translated = await translateLocale(locales.en, lang);
          if (translated) {
            setCustomLocale(translated as Translation);
            try {
              localStorage.setItem(`saarthi-locale-${lang}`, JSON.stringify(translated));
            } catch (e) {
              console.error("Could not cache translated locale:", e);
              // Clear some old cache if storage is full
              // For simplicity, we are not implementing a full LRU cache here
            }
          } else {
            throw new Error('Translation failed, received null from service.');
          }
        }
        setLanguageState(lang);
        localStorage.setItem('saarthi-lang', lang);
      } catch (error) {
        console.error("Failed to translate locale:", error);
        setToast({ message: 'Could not translate the website. Reverting to English.', type: 'error' });
        setCustomLocale(null);
        setLanguageState('en');
        localStorage.setItem('saarthi-lang', 'en');
      } finally {
        setIsTranslating(false);
      }
    }
  };
  
  const toggleSimpleMode = () => {
    setIsSimpleMode(prev => !prev);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
  };

  const updateProgress = (taskId: string, stepId: string, completed: boolean) => {
    setProgress(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [stepId]: completed,
      },
    }));
  };
  
  const getTaskProgress = (taskId: string) => {
      const taskProgress = progress[taskId];
      if (!taskProgress) return 0;
      // Need to fetch task steps count from somewhere, this is a simplification
      const totalSteps = 6; // This is a temporary hack
      const steps = Object.values(taskProgress);
      const completedSteps = steps.filter(Boolean).length;
      return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  }

  const login = () => {
      setIsAuthenticated(true);
      setShowLoginModal(false);
  };
  const logout = () => setIsAuthenticated(false);
  
  const toggleSaveTask = (taskId: string) => {
    setSavedTasks(prev => {
        const isSaved = prev.includes(taskId);
        if (isSaved) {
            setToast({ message: 'Task removed from saved items', type: 'success' });
            return prev.filter(id => id !== taskId);
        } else {
            setToast({ message: 'Task saved for later', type: 'success' });
            return [...prev, taskId];
        }
    });
  };

  const toggleSaveScheme = (schemeId: string) => {
    setSavedSchemes(prev => {
        const isSaved = prev.includes(schemeId);
        if (isSaved) {
             setToast({ message: 'Scheme removed from saved items', type: 'success' });
            return prev.filter(id => id !== schemeId);
        } else {
             setToast({ message: 'Scheme saved for later', type: 'success' });
            return [...prev, schemeId];
        }
    });
  };

  const t = useCallback((key: string, textToKeep: string = ""): string => {
    const keys = key.split('.');
    
    // App name is always in English
    if (key === 'app_name') {
        return locales.en.app_name as string;
    }

    // Handle Simple Mode first as an override
    if (isSimpleMode) {
        const simpleKeys = ['simple', ...keys];
        let simpleLocale: any = (language === 'en' || language === 'hi') ? locales[language] : customLocale;
        if (simpleLocale) {
            let simpleResult: any = simpleLocale;
            for (const k of simpleKeys) {
                if (simpleResult === undefined) { simpleResult = undefined; break; }
                simpleResult = simpleResult[k];
            }
            if (typeof simpleResult === 'string') {
                return simpleResult;
            }
        }
        // Fallback to simple english if not found in custom simple
        let fallbackSimple: any = (locales.en as any).simple;
         for (const k of keys) {
            if (fallbackSimple === undefined) { fallbackSimple = undefined; break; }
            fallbackSimple = fallbackSimple[k];
        }
        if(typeof fallbackSimple === 'string') return fallbackSimple;
    }
    
    // Determine the primary locale to use
    let activeLocale: Translation | undefined | null;
    if (language === 'en' || language === 'hi') {
        activeLocale = locales[language];
    } else {
        activeLocale = customLocale; // Use the dynamically translated locale
    }

    // Traverse the active locale
    let result: any = activeLocale;
    for (const k of keys) {
        if (result === undefined) break;
        result = result[k];
    }

    // If not found, traverse the English fallback
    if (typeof result !== 'string') {
        let fallbackResult: any = locales.en;
        for (const k of keys) {
            if (fallbackResult === undefined) {
                fallbackResult = undefined;
                break;
            };
            fallbackResult = fallbackResult[k];
        }
        result = (typeof fallbackResult === 'string') ? fallbackResult : key;
    }
    
    if (language === 'hi' && textToKeep) {
        const shouldKeep = UNTRANSLATABLE_WORDS_HI.some(word => textToKeep.includes(word));
        if (shouldKeep) {
            return textToKeep;
        }
    }

    return result || key;
  }, [language, customLocale, isSimpleMode]);
  
  const updateSchemes = async () => {
    setIsUpdatingSchemes(true);
    setToast({ message: t('schemes.updating'), type: 'success' });
    try {
        const newSchemes = await updateSchemesOnServer();
        setSchemes(newSchemes);
        setSchemesLastUpdated(new Date());
        setToast({ message: t('schemes.updated'), type: 'success' });
    } catch (error) {
        console.error("Failed to update schemes:", error);
        setToast({ message: 'Failed to update schemes.', type: 'error' });
    } finally {
        setIsUpdatingSchemes(false);
    }
  };
  
  const updateTasks = async () => {
    setIsUpdatingTasks(true);
    setToast({ message: t('tasks.updating'), type: 'success' });
    try {
        const newTasks = await updateTasksOnServer(isSimpleMode);
        setTasks(newTasks);
        setTasksLastUpdated(new Date());
        setToast({ message: t('tasks.updated'), type: 'success' });
    } catch (error) {
        console.error("Failed to update tasks:", error);
        setToast({ message: 'Failed to update tasks.', type: 'error' });
    } finally {
        setIsUpdatingTasks(false);
    }
  };


  return (
    <AppContext.Provider value={{
        language, setLanguage, t,
        userRole, setUserRole,
        progress, updateProgress, getTaskProgress,
        isAuthenticated, login, logout,
        showLoginModal, setShowLoginModal,
        schemes, updateSchemes, isUpdatingSchemes, schemesLastUpdated,
        tasks, updateTasks, isUpdatingTasks, tasksLastUpdated,
        toast, setToast,
        theme, setTheme,
        isSimpleMode, toggleSimpleMode,
        savedTasks, toggleSaveTask,
        savedSchemes, toggleSaveScheme,
        isTranslating,
    }}>
      {children}
    </AppContext.Provider>
  );
};