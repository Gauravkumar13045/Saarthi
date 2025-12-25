import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Saarthi Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" /> 
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
    </defs>
    <path
      d="M 80,20 C 80,10 70,10 60,10 S 20,10 20,30 S 80,70 80,90 S 30,90 20,90"
      fill="none"
      stroke="url(#logoGradient)"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
