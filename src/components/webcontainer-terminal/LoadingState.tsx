'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Initializing terminal...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-900 rounded-lg">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-white text-lg">{message}</p>
      <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
    </div>
  );
};

export default LoadingState;
