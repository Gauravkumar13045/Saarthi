
import React, { useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const Toast = () => {
  const { toast, setToast } = useAppContext();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const bgColor = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300 animate-fade-in-out`}>
      {toast.message}
    </div>
  );
};

export default Toast;
