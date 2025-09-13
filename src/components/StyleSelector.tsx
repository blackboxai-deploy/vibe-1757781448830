'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IMAGE_SETTINGS } from '@/lib/constants';

interface StyleSelectorProps {
  selectedStyle?: string;
  onStyleChange: (styleId: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function StyleSelector({
  selectedStyle,
  onStyleChange,
  className,
  disabled = false
}: StyleSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleStyles = showAll ? IMAGE_SETTINGS.STYLES : IMAGE_SETTINGS.STYLES.slice(0, 4);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Style Preset
        </h3>
        {selectedStyle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStyleChange('')}
            className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
            disabled={disabled}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {visibleStyles.map((style) => (
          <Button
            key={style.id}
            variant={selectedStyle === style.id ? "default" : "outline"}
            className={cn(
              'h-auto p-3 flex flex-col items-center text-center space-y-2 transition-all',
              'hover:shadow-md hover:scale-[1.02]',
              selectedStyle === style.id && 'ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
            )}
            onClick={() => onStyleChange(style.id)}
            disabled={disabled}
          >
            {/* Style icon/emoji */}
            <div className="text-lg">
              {getStyleIcon(style.id)}
            </div>
            
            {/* Style name */}
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {style.name}
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                {style.description}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Show more/less toggle */}
      {IMAGE_SETTINGS.STYLES.length > 4 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-gray-600 hover:text-gray-800"
            disabled={disabled}
          >
            {showAll ? 'Show Less' : `Show All ${IMAGE_SETTINGS.STYLES.length} Styles`}
          </Button>
        </div>
      )}

      {/* Selected style info */}
      {selectedStyle && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm">
            <span className="font-medium text-blue-900">Selected Style:</span>
            <span className="ml-2 text-blue-700">
              {IMAGE_SETTINGS.STYLES.find(s => s.id === selectedStyle)?.name}
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            This will enhance your prompt with: "{IMAGE_SETTINGS.STYLES.find(s => s.id === selectedStyle)?.prompt}"
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get style icons
function getStyleIcon(styleId: string): string {
  const icons: Record<string, string> = {
    realistic: '📸',
    artistic: '🎨',
    'digital-art': '💻',
    fantasy: '✨',
    abstract: '🎭',
    vintage: '📼'
  };
  
  return icons[styleId] || '🎨';
}