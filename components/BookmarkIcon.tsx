import React from 'react';

interface BookmarkIconProps {
  isSaved: boolean;
  onClick: () => void;
  label: string;
  savedLabel: string;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ isSaved, onClick, label, savedLabel }) => {
  const title = isSaved ? savedLabel : label;
  return (
    <button
      onClick={onClick}
      className="no-print p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={title}
      aria-label={title}
    >
      {isSaved ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-indigo" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
};

export default BookmarkIcon;