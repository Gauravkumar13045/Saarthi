import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ScamAlert as ScamAlertType } from '../types';

interface ScamAlertProps {
  alerts: ScamAlertType[];
}

const ScamAlert: React.FC<ScamAlertProps> = ({ alerts }) => {
  const { language } = useAppContext();
  
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const severityStyles = {
    info: 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-500 dark:text-yellow-300',
    critical: 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300',
  };

  return (
    <div className="my-8">
      {alerts.map((alert, index) => (
        <div key={index} className={`p-4 rounded-lg border-l-4 mb-4 ${severityStyles[alert.severity]}`}>
          <p className="font-bold text-lg">
            {language === 'hi' ? alert.message.hi : alert.message.en}
          </p>
        </div>
      ))}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        {language === 'hi' 
          ? 'सारथी का मकसद आपको गलत जानकारी और फ्रॉड से बचाना है। फाइनल प्रक्रिया हमेशा ऑफिशियल पोर्टल पर ही करें।' 
          : 'Saarthi aims to protect you from misinformation and fraud. Always complete the final process on the official portal.'
        }
      </p>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
        Safety information last updated: {new Date().toLocaleDateString('en-IN')}
      </p>
    </div>
  );
};

export default ScamAlert;