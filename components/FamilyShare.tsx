import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ShareType } from '../types';
import { SonIcon, DaughterIcon, BrotherIcon, CscOperatorIcon, OtherIcon, WhatsAppIcon, CopyLinkIcon } from '../assets/ShareIcons';
import { BackIcon } from '../assets/ChatbotIcon';

interface FamilyShareProps {
  itemId: string;
  itemType: 'task' | 'scheme';
}

const FamilyShare: React.FC<FamilyShareProps> = ({ itemId, itemType }) => {
  const { t, setToast } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<ShareType | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const shareOptions: { type: ShareType; icon: React.ReactElement; label: string }[] = [
    { type: 'son', icon: <SonIcon />, label: t('familyShare.son') },
    { type: 'daughter', icon: <DaughterIcon />, label: t('familyShare.daughter') },
    { type: 'brother', icon: <BrotherIcon />, label: t('familyShare.brother') },
    { type: 'csc', icon: <CscOperatorIcon />, label: t('familyShare.csc') },
    { type: 'other', icon: <OtherIcon />, label: t('familyShare.other') },
  ];
  
  const handleRelationSelect = (type: ShareType) => {
    setSelectedRelation(type);
    // Simulate anonymous tracking
    console.log('Share event tracked (anonymous):', {
      shareType: type,
      itemId: itemId,
      itemType: itemType,
      timestamp: new Date().toISOString()
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
        setSelectedRelation(null);
        setIsCopied(false);
    }, 300); // Wait for animation
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}#/${itemType}/${itemId}?view=share`;
  const whatsappText = encodeURIComponent(`${t('familyShare.whatsappMessage')} ${shareUrl}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappText}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
        setIsCopied(true);
        setToast({ message: t('general.copied'), type: 'success' });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="button-like w-full sm:w-auto justify-center flex items-center gap-3 bg-gradient-to-r from-brand-teal to-green-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-lg btn-glow"
      >
        {t('familyShare.title')}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
            {selectedRelation ? (
              <div>
                 <button onClick={() => setSelectedRelation(null)} className="flex items-center gap-1 text-sm text-brand-gray dark:text-gray-400 hover:text-black dark:hover:text-white mb-4">
                    <BackIcon /> Back
                 </button>
                 <h3 className="text-xl font-bold text-center mb-4 dark:text-white">{t('familyShare.shareVia')}</h3>
                 <div className="space-y-4">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="button-like w-full flex items-center justify-center gap-3 bg-green-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                        <WhatsAppIcon /> {t('familyShare.whatsapp')}
                    </a>
                    <button onClick={copyToClipboard} className="button-like w-full flex items-center justify-center gap-3 bg-gray-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        <CopyLinkIcon /> {isCopied ? t('general.copied') : t('familyShare.copyLink')}
                    </button>
                 </div>
                 <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">{t('familyShare.helperText')}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-center mb-6 dark:text-white">{t('familyShare.modalTitle')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {shareOptions.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => handleRelationSelect(opt.type)}
                      className="flex flex-col items-center justify-center gap-2 p-3 bg-brand-off-white dark:bg-gray-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors border-2 border-transparent hover:border-brand-indigo"
                    >
                      {opt.icon}
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">{t('familyShare.trustNote')}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FamilyShare;
