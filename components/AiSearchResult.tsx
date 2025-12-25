import React from 'react';

interface AiSearchResultProps {
  content: string;
}

const AiSearchResult: React.FC<AiSearchResultProps> = ({ content }) => {
  // Use a regex that can handle newlines in the content
  const contentParts = content.split(/(\n)/);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-brand-teal mt-8 text-gray-700 dark:text-gray-300 leading-relaxed">
      {contentParts.map((line, index) => {
        if (line === '\n') {
          return <br key={index} />;
        }
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">{trimmedLine.replace('### ', '')}</h3>;
        }
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          return <p key={index} className="font-bold mt-2">{trimmedLine.replace(/\*\*/g, '')}</p>;
        }
        if (trimmedLine.startsWith('* ')) {
          const linkMatch = trimmedLine.match(/^\* \[(.+)\]\((.+)\)$/);
          if (linkMatch) {
              const [, title, url] = linkMatch;
              return (
                  <li key={index} className="ml-5 list-disc my-1">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-indigo dark:text-brand-indigo-light hover:underline">
                          {title}
                      </a>
                  </li>
              );
          }
          return <li key={index} className="ml-5 list-disc my-1">{trimmedLine.replace('* ', '')}</li>;
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

export default AiSearchResult;