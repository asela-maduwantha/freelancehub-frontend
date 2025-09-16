import React from 'react';
import { Loader } from '../../ui/Feedback';

interface ComponentLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ComponentLoader: React.FC<ComponentLoaderProps> = ({
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader size={size} />
    </div>
  );
};

export default ComponentLoader;