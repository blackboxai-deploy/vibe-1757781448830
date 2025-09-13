'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { APP_SETTINGS } from '@/lib/constants';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnhance?: (prompt: string) => void;
  onGenerate?: (prompt: string) => void;
  isGenerating?: boolean;
  isEnhancing?: boolean;
  placeholder?: string;
  className?: string;
  showEnhanceButton?: boolean;
  showCharacterCount?: boolean;
}

export default function PromptInput({
  value,
  onChange,
  onEnhance,
  onGenerate,
  isGenerating = false,
  isEnhancing = false,
  placeholder = "Describe the image you want to generate...",
  className,
  showEnhanceButton = true,
  showCharacterCount = true
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const characterCount = value.length;
  const isOverLimit = characterCount > APP_SETTINGS.MAX_PROMPT_LENGTH;
  const isNearLimit = characterCount > APP_SETTINGS.MAX_PROMPT_LENGTH * 0.8;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onGenerate && !isGenerating) {
      e.preventDefault();
      onGenerate(value);
    }
  }, [value, onGenerate, isGenerating]);

  const handleEnhance = useCallback(() => {
    if (onEnhance && value.trim() && !isEnhancing) {
      onEnhance(value.trim());
    }
  }, [onEnhance, value, isEnhancing]);

  const handleGenerate = useCallback(() => {
    if (onGenerate && value.trim() && !isGenerating) {
      onGenerate(value.trim());
    }
  }, [onGenerate, value, isGenerating]);

  return (
    <div className={cn('relative space-y-4', className)}>
      {/* Main input area */}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'min-h-[120px] resize-none transition-all duration-200',
            'border-2 rounded-xl px-4 py-3',
            isFocused && 'ring-2 ring-blue-500/20',
            isOverLimit && 'border-red-500 focus:ring-red-500/20',
            'placeholder:text-gray-400'
          )}
          disabled={isGenerating}
        />
        
        {/* Character count */}
        {showCharacterCount && (
          <div className={cn(
            'absolute bottom-3 right-3 text-xs transition-colors',
            isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-400'
          )}>
            {characterCount}/{APP_SETTINGS.MAX_PROMPT_LENGTH}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {showEnhanceButton && onEnhance && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnhance}
            disabled={!value.trim() || isEnhancing || isGenerating}
            className="flex items-center gap-2"
          >
            {isEnhancing ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : (
              <span>✨</span>
            )}
            {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
          </Button>
        )}
        
        {onGenerate && (
          <Button
            onClick={handleGenerate}
            disabled={!value.trim() || isGenerating || isOverLimit}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="sm"
          >
            {isGenerating ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span>🎨</span>
            )}
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-xs text-gray-500 text-center">
        Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border rounded">Ctrl+Enter</kbd> to generate
      </div>

      {/* Error message for character limit */}
      {isOverLimit && (
        <p className="text-sm text-red-500 text-center">
          Prompt is too long. Please reduce by {characterCount - APP_SETTINGS.MAX_PROMPT_LENGTH} characters.
        </p>
      )}
    </div>
  );
}