import React from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex justify-center items-center" onClick={onClose}>
      <div className="relative bg-black rounded-lg shadow-xl w-full max-w-3xl m-4" onClick={e => e.stopPropagation()}>
        <div className="aspect-w-16 aspect-h-9">
            {embedUrl ? (
                 <iframe 
                    src={embedUrl}
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                    style={{ aspectRatio: '16 / 9' }}
                ></iframe>
            ) : (
                <div className="flex items-center justify-center h-full text-white">Invalid YouTube URL</div>
            )}
        </div>
        <button onClick={onClose} className="absolute -top-3 -right-3 bg-white dark:bg-gray-700 rounded-full p-1.5 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default VideoModal;