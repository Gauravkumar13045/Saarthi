import React from 'react';

// A dictionary mapping keywords (in lowercase) to relevant emojis.
const iconMap: Record<string, string> = {
    'website': '🌐',
    'portal': '🌐',
    'form': '📝',
    'fill': '📝',
    'upload': '📤',
    'documents': '📄',
    'aadhaar': '🆔',
    'pan': '🆔',
    'photo': '🖼️',
    'signature': '✍️',
    'pay': '💳',
    'fee': '💳',
    'payment': '💳',
    'receive': '📥',
    'acknowledgement': '🧾',
    'track': '📍',
    'submit': '✅',
    'verify': '✅',
    'choose': '🤔',
    'gather': '🗂️',
    'deposit': '🏦',
    'bank': '🏦',
    'atm': '🏧',
    'visit': '🚶',
    'office': '🏢',
};

// A default icon for steps that don't match any keyword.
const defaultIcon = '➡️';

interface StepIconProps {
  title: string;
}

/**
 * A component that displays an icon based on keywords in a step title.
 * It searches for keywords from the iconMap in the title and returns the corresponding emoji.
 */
export const StepIcon: React.FC<StepIconProps> = ({ title }) => {
  const normalizedTitle = title.toLowerCase();

  for (const keyword in iconMap) {
    if (normalizedTitle.includes(keyword)) {
      return <span className="text-3xl" role="img">{iconMap[keyword]}</span>;
    }
  }

  return <span className="text-3xl" role="img">{defaultIcon}</span>;
};