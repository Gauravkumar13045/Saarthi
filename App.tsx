
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
// FIX: The useAppContext hook is exported from hooks/useAppContext, not from the context file itself.
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import LifeTasksPage from './pages/LifeTasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import GovtSchemesPage from './pages/GovtSchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import DashboardPage from './pages/DashboardPage';
import Toast from './components/Toast';
import Chatbot from './components/Chatbot';
import SharedViewHeader from './components/SharedViewHeader';
import TranslationLoader from './components/TranslationLoader';

const useIsSharedView = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get('view') === 'share';
}

const AnimatedRoutes = () => {
  const location = useLocation();
  const isSharedView = useIsSharedView();
  
  return (
      <main className={`flex-grow ${!isSharedView ? 'pt-20' : ''} page-fade-in`} key={location.pathname + location.search}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/life-tasks" element={<LifeTasksPage />} />
          <Route path="/task/:taskId" element={<TaskDetailPage />} />
          <Route path="/govt-schemes" element={<GovtSchemesPage />} />
          <Route path="/scheme/:schemeId" element={<SchemeDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
  );
}

const AppContent = () => {
    const isSharedView = useIsSharedView();
    const { isTranslating } = useAppContext();

    return (
        <div className={`flex flex-col min-h-screen font-sans text-gray-800 ${isSharedView ? 'share-view' : ''}`}>
            {isTranslating && <TranslationLoader />}
            {isSharedView ? <SharedViewHeader /> : <Navbar />}
            <AnimatedRoutes />
            {!isSharedView && <Footer />}
            {!isSharedView && <Chatbot />}
            <Toast />
        </div>
    )
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}

export default App;