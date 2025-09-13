'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  progress?: number;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  progress,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {/* Spinner */}
      <div className="relative">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
            sizeClasses[size]
          )}
        />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-48 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {/* Text */}
      {text && (
        <p className={cn(
          'text-gray-600 text-center max-w-xs',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

// Specialized loading components
export function ImageGenerationLoader({ 
  currentBatch = 1, 
  totalBatches = 1,
  className 
}: { 
  currentBatch?: number; 
  totalBatches?: number;
  className?: string;
}) {
  const progress = totalBatches > 1 ? (currentBatch / totalBatches) * 100 : undefined;
  
  return (
    <LoadingSpinner
      size="lg"
      progress={progress}
      text={
        totalBatches > 1 
          ? `Generating images... (${currentBatch}/${totalBatches})`
          : 'Generating your AI image...'
      }
      className={className}
    />
  );
}

export function PromptEnhancementLoader({ className }: { className?: string }) {
  return (
    <LoadingSpinner
      size="sm"
      text="Enhancing your prompt..."
      className={className}
    />
  );
}

export function DownloadLoader({ 
  progress, 
  isMultiple = false,
  className 
}: { 
  progress?: number; 
  isMultiple?: boolean;
  className?: string;
}) {
  return (
    <LoadingSpinner
      size="md"
      progress={progress}
      text={isMultiple ? 'Downloading images...' : 'Downloading image...'}
      className={className}
    />
  );
}