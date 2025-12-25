import React, { useState, useRef, useEffect } from 'react';

type Option = {
    value: string;
    label: string;
    icon?: React.ReactElement | null;
}

interface CustomDropdownProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, selectedValue, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const selectedOption = options.find(opt => opt.value === selectedValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleSelect = (value: string) => {
        onSelect(value);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-indigo-light focus:border-brand-indigo transition-colors"
            >
                <div className="flex items-center gap-3">
                    {selectedOption?.icon}
                    <span className="font-medium text-black dark:text-white">{selectedOption?.label || 'Select...'}</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1.5 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-600 z-50 py-1 dropdown-enter-active">
                    {options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium ${selectedValue === option.value ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;