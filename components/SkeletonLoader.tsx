
import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-300 rounded ${className}`}></div>
  );
};

export default SkeletonLoader;
