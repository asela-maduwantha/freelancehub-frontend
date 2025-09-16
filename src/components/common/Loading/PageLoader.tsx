import React from 'react';
import { Loader } from '../../ui/Feedback';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${className}`}>
      <Loader size="lg" />
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
    </div>
  );
};

export default PageLoader;